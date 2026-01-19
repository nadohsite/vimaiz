<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreServiceRequestRequest;
use App\Models\Property;
use App\Models\ServiceRequest;
use App\Services\QuoteCalculationService;
use Carbon\Carbon;
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
            ->get(['id', 'name', 'type', 'city', 'surface_area']);

        if ($properties->isEmpty()) {
            return redirect()
                ->route('client.properties.create')
                ->with('info', 'Veuillez d\'abord ajouter un logement.');
        }

        return Inertia::render('Client/Requests/Create', [
            'properties' => $properties,
            'minDate' => now()->addDay()->format('Y-m-d'),
            'maxDate' => now()->addMonths(3)->format('Y-m-d'),
        ]);
    }

    public function store(StoreServiceRequestRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $serviceRequest = ServiceRequest::create([
            'client_id' => auth()->id(),
            'property_id' => $data['property_id'],
            'scheduled_date' => $data['scheduled_date'],
            'scheduled_time' => $data['scheduled_time'],
            'requested_hours' => $data['requested_hours'],
            'special_instructions' => $data['special_instructions'] ?? null,
            'status' => ServiceRequest::STATUS_PENDING,
        ]);

        return redirect()
            ->route('client.requests.show', $serviceRequest)
            ->with('success', 'Votre demande a été envoyée. Vous recevrez un devis sous 24h.');
    }

    public function show(ServiceRequest $serviceRequest): Response
    {
        $this->authorize('view', $serviceRequest);

        $serviceRequest->load([
            'property',
            'quote',
            'mission.agent',
            'mission.photos',
        ]);

        return Inertia::render('Client/Requests/Show', [
            'serviceRequest' => $serviceRequest,
            'canCancel' => $serviceRequest->canBeCancelled(),
            'canPay' => $serviceRequest->quote?->canBeAccepted() ?? false,
        ]);
    }

    public function cancel(ServiceRequest $serviceRequest): RedirectResponse
    {
        $this->authorize('cancel', $serviceRequest);

        if (!$serviceRequest->canBeCancelled()) {
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
            'requested_hours' => ['required', 'numeric', 'min:2', 'max:12'],
        ]);

        $property = Property::findOrFail($validated['property_id']);
        
        if ($property->user_id !== auth()->id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $scheduledAt = Carbon::parse(
            $validated['scheduled_date'] . ' ' . $validated['scheduled_time']
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
            ServiceRequest::STATUS_ASSIGNED => 'Agent attribué',
            ServiceRequest::STATUS_IN_PROGRESS => 'En cours',
            ServiceRequest::STATUS_COMPLETED => 'Terminée',
            ServiceRequest::STATUS_CANCELLED => 'Annulée',
        ];
    }
}
