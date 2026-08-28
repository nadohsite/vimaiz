<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreServiceRequestRequest;
use App\Models\MissionAnomaly;
use App\Models\Property;
use App\Models\Quote;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Notifications\NewServiceRequestNotification;
use App\Notifications\ServiceRequestReceivedNotification;
use App\Services\QuoteCalculationService;
use App\Support\DefaultPropertyChecklist;
use App\Support\ScheduledTime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceRequestController extends Controller
{
    public function __construct(
        protected QuoteCalculationService $quoteService
    ) {}

    public function index(): Response
    {
        $requests = auth()->user()
            ->serviceRequests()
            ->with(['property', 'quote', 'mission'])
            ->orderByDesc('created_at')
            ->paginate(10);

        return Inertia::render('Client/Requests/Index', [
            'requests' => $requests,
            'statuses' => $this->getStatusLabels(),
        ]);
    }

    public function create(): Response|RedirectResponse
    {
        $properties = auth()->user()
            ->properties()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'city', 'surface_area', 'checklist']);

        if ($properties->isEmpty()) {
            return redirect()
                ->route('client.properties.create')
                ->with('info', 'Veuillez d\'abord ajouter un bien.');
        }

        $defaultChecklist = DefaultPropertyChecklist::sections();

        $properties = $properties->map(function (Property $property) use ($defaultChecklist) {
            return [
                'id' => $property->id,
                'name' => $property->name,
                'type' => $property->type,
                'city' => $property->city,
                'surface_area' => $property->surface_area,
                'checklist' => (! empty($property->checklist))
                    ? $property->checklist
                    : $defaultChecklist,
            ];
        });

        $fromAnomaly = null;
        $anomalyId = request()->query('anomaly_id');
        if ($anomalyId) {
            $anomaly = MissionAnomaly::query()
                ->with('mission')
                ->find($anomalyId);

            if (
                $anomaly
                && $anomaly->mission
                && $anomaly->mission->client_id === auth()->id()
                && ! $anomaly->hasFollowUp()
            ) {
                $fromAnomaly = [
                    'id' => $anomaly->id,
                    'property_id' => $anomaly->property_id,
                    'category_label' => $anomaly->category_label,
                    'label' => $anomaly->label,
                    'notes' => $anomaly->notes,
                    'mission_date' => $anomaly->mission->completed_at?->format('d/m/Y')
                        ?? $anomaly->mission->scheduled_at?->format('d/m/Y'),
                ];
            }
        }

        return Inertia::render('Client/Requests/Create', [
            'properties' => $properties,
            'minDate' => now()->addDay()->format('Y-m-d'),
            'maxDate' => now()->addMonths(3)->format('Y-m-d'),
            'selectedPropertyId' => request()->query('property_id') ?: $fromAnomaly['property_id'] ?? null,
            'fromAnomaly' => $fromAnomaly,
        ]);
    }

    public function store(StoreServiceRequestRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $property = Property::findOrFail($data['property_id']);
        $checklist = DefaultPropertyChecklist::filterForRequest(
            $property->checklist,
            $data['checklist_section_ids'],
            $data['checklist_item_ids']
        );

        $serviceRequest = ServiceRequest::create([
            'client_id' => auth()->id(),
            'property_id' => $data['property_id'],
            'scheduled_date' => $data['scheduled_date'],
            'scheduled_time' => $data['scheduled_time'],
            'requested_hours' => $data['requested_hours'] ?? null,
            'special_instructions' => $data['special_instructions'] ?? null,
            'checklist' => $checklist,
            'status' => ServiceRequest::STATUS_PENDING,
        ]);

        if (! empty($data['anomaly_id'])) {
            $anomaly = MissionAnomaly::with('mission')->find($data['anomaly_id']);
            if (
                $anomaly
                && $anomaly->mission?->client_id === auth()->id()
                && ! $anomaly->hasFollowUp()
            ) {
                $anomaly->update(['follow_up_service_request_id' => $serviceRequest->id]);
            }
        }

        $serviceRequest->load(['property', 'client']);

        $serviceRequest->client?->notify(new ServiceRequestReceivedNotification($serviceRequest));

        $admins = User::admins()->get();
        foreach ($admins as $admin) {
            $admin->notify(new NewServiceRequestNotification($serviceRequest));
        }

        return redirect()
            ->route('client.requests.show', $serviceRequest)
            ->with('success', 'Votre demande a été envoyée. Vous recevrez un devis sous 24h.');
    }

    public function show(ServiceRequest $serviceRequest): Response
    {
        abort_unless($serviceRequest->client_id === auth()->id(), 403);

        $serviceRequest->load([
            'property',
            'quote',
            'mission.agent',
            'mission.photos',
        ]);

        return Inertia::render('Client/Requests/Show', [
            'serviceRequest' => $serviceRequest,
            'canCancel' => $serviceRequest->canBeCancelled(),
            'canAcceptQuote' => $serviceRequest->quote?->canBeAccepted() ?? false,
            'canProceedToPayment' => $serviceRequest->quote?->status === Quote::STATUS_ACCEPTED
                && ! $serviceRequest->mission?->isPaid(),
        ]);
    }

    public function cancel(ServiceRequest $serviceRequest): RedirectResponse
    {
        abort_unless($serviceRequest->client_id === auth()->id(), 403);

        if (! $serviceRequest->canBeCancelled()) {
            return back()->with('error', 'Cette demande ne peut plus être annulée.');
        }

        $serviceRequest->update([
            'status' => ServiceRequest::STATUS_CANCELLED,
            'cancellation_reason' => 'Annulée par le client',
            'cancelled_at' => now(),
        ]);

        return redirect()
            ->route('client.requests.index')
            ->with('success', 'Votre demande a été annulée.');
    }

    public function estimate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => ['required', 'exists:properties,id'],
            'scheduled_date' => ['required', 'date'],
            'scheduled_time' => ['required', 'date_format:H:i'],
            'requested_hours' => ['required', 'numeric', 'min:1', 'max:12'],
        ]);

        $property = Property::findOrFail($validated['property_id']);

        if ($property->user_id !== auth()->id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $scheduledAt = ScheduledTime::combine(
            $validated['scheduled_date'],
            $validated['scheduled_time']
        );

        try {
            $estimate = $this->quoteService->getEstimateForProperty(
                $property,
                (float) $validated['requested_hours'],
                $scheduledAt
            );

            return response()->json([
                'success' => true,
                'estimate' => $estimate,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de calculer l\'estimation.',
            ], 500);
        }
    }

    private function getStatusLabels(): array
    {
        return [
            ServiceRequest::STATUS_PENDING => 'En attente de devis',
            ServiceRequest::STATUS_QUOTE_SENT => 'Devis envoyé',
            ServiceRequest::STATUS_QUOTE_ACCEPTED => 'Devis accepté',
            ServiceRequest::STATUS_QUOTE_REFUSED => 'Devis refusé',
            ServiceRequest::STATUS_PAID => 'Payé',
            ServiceRequest::STATUS_ASSIGNED => 'Intervenant assigné',
            ServiceRequest::STATUS_IN_PROGRESS => 'En cours',
            ServiceRequest::STATUS_COMPLETED => 'Terminée',
            ServiceRequest::STATUS_CANCELLED => 'Annulée',
        ];
    }
}
