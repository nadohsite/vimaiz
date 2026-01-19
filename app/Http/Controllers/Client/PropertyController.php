<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StorePropertyRequest;
use App\Http\Requests\Client\UpdatePropertyRequest;
use App\Models\Property;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
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
        ]);
    }

    public function store(StorePropertyRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();

        Property::create($data);

        return redirect()
            ->route('client.properties.index')
            ->with('success', 'Logement ajouté avec succès.');
    }

    public function show(Property $property): Response
    {
        $this->authorize('view', $property);

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
        $this->authorize('update', $property);

        return Inertia::render('Client/Properties/Edit', [
            'property' => $property,
            'propertyTypes' => Property::TYPES,
        ]);
    }

    public function update(UpdatePropertyRequest $request, Property $property): RedirectResponse
    {
        $property->update($request->validated());

        return redirect()
            ->route('client.properties.show', $property)
            ->with('success', 'Logement mis à jour avec succès.');
    }

    public function destroy(Property $property): RedirectResponse
    {
        $this->authorize('delete', $property);

        if (!$property->canBeDeleted()) {
            return back()->with('error', 'Ce logement a des demandes en cours et ne peut pas être supprimé.');
        }

        $property->delete();

        return redirect()
            ->route('client.properties.index')
            ->with('success', 'Logement supprimé avec succès.');
    }
}
