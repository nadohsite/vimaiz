<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StorePropertyRequest;
use App\Http\Requests\Client\UpdatePropertyRequest;
use App\Models\Property;
use App\Services\GeocodingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    public function __construct(
        protected GeocodingService $geocodingService
    ) {}

    public function index(): Response
    {
        $properties = auth()->user()
            ->properties()
            ->withCount(['serviceRequests as active_requests_count' => function ($query) {
                $query->whereNotIn('status', ['completed', 'cancelled']);
            }])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Client/Properties/Index', [
            'properties' => $properties,
            'propertyTypes' => Property::TYPES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Client/Properties/Create', [
            'propertyTypes' => Property::TYPES,
            'defaultChecklist' => \App\Support\DefaultPropertyChecklist::sections(),
        ]);
    }

    public function store(StorePropertyRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();

        // Geocode address if coordinates not provided
        $data = $this->geocodingService->geocodeProperty($data);

        Property::create($data);

        return redirect()
            ->route('client.properties.index')
            ->with('success', 'Logement ajouté avec succès.');
    }

    public function show(Property $property): Response
    {
        abort_unless($property->user_id === auth()->id(), 403);

        $property->load([
            'serviceRequests' => fn ($q) => $q->latest()->limit(5),
            'serviceRequests.quote',
            'missions' => fn ($q) => $q->latest('scheduled_at')->limit(5),
        ]);

        return Inertia::render('Client/Properties/Show', [
            'property' => $property,
            'propertyTypes' => Property::TYPES,
        ]);
    }

    public function edit(Property $property): Response
    {
        abort_unless($property->user_id === auth()->id(), 403);

        return Inertia::render('Client/Properties/Edit', [
            'property' => $property,
            'propertyTypes' => Property::TYPES,
            'defaultChecklist' => \App\Support\DefaultPropertyChecklist::sections(),
        ]);
    }

    public function update(UpdatePropertyRequest $request, Property $property): RedirectResponse
    {
        $data = $request->validated();

        // Re-geocode if address changed and no coordinates provided
        $addressChanged = 
            ($data['address_line1'] ?? null) !== $property->address_line1 ||
            ($data['city'] ?? null) !== $property->city ||
            ($data['postal_code'] ?? null) !== $property->postal_code;

        if ($addressChanged && empty($data['latitude']) && empty($data['longitude'])) {
            $data = $this->geocodingService->geocodeProperty($data);
        }

        $property->update($data);

        return redirect()
            ->route('client.properties.show', $property)
            ->with('success', 'Logement mis à jour avec succès.');
    }

    public function destroy(Property $property): RedirectResponse
    {
        abort_unless($property->user_id === auth()->id(), 403);

        if (!$property->canBeDeleted()) {
            return back()->with('error', 'Ce logement a des demandes en cours et ne peut pas être supprimé.');
        }

        $property->delete();

        return redirect()
            ->route('client.properties.index')
            ->with('success', 'Logement supprimé avec succès.');
    }
}
