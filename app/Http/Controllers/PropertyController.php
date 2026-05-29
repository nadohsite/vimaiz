<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Support\UploadHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PropertyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $properties = Auth::user()->properties()->latest()->get();

        return Inertia::render('Property/Index', [
            'properties' => $properties
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Property/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'nullable',
            'type' => 'required|in:maison,villa,chalet',
            'name' => 'nullable|string|max:255',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'postal_code' => 'required|string|max:20',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'surface_area' => 'required|numeric|min:1',
            'bedrooms' => 'required|integer|min:0',
            'bathrooms' => 'required|integer|min:0',
            'toilets' => 'required|integer|min:0',
            'floors' => 'required|integer|min:0',
            'external_surface' => 'nullable|numeric|min:0',
            'access_code' => 'nullable|string',
            'entry_instructions' => 'nullable|string',
            'photos' => 'nullable|array',
            'photos.*' => [
                'file',
                'max:'.UploadHelper::propertyPhotoMaxKb(),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! UploadHelper::isImageUpload($value)) {
                        $fail('Chaque fichier doit être une image.');
                    }
                },
            ],
        ]);

        $photoPaths = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $photoPaths[] = $photo->store('properties', 'public');
            }
        }
        $validated['photos'] = $photoPaths;

        $request->user()->properties()->create($validated);

        return redirect()->route('properties.index')->with('success', 'Bien ajouté avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Property $property)
    {
        $this->authorize('view', $property);
        return Inertia::render('Property/Show', [
            'property' => $property
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Property $property)
    {
        if ($request->user()->id !== $property->user_id) {
            abort(403);
        }
        
        return Inertia::render('Property/Edit', [
            'property' => $property
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Property $property)
    {
        if ($request->user()->id !== $property->user_id) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|in:maison,villa,chalet',
            'name' => 'nullable|string|max:255',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'postal_code' => 'required|string|max:20',
            'surface_area' => 'required|numeric|min:1',
            'bedrooms' => 'required|integer|min:0',
            'bathrooms' => 'required|integer|min:0',
            'toilets' => 'required|integer|min:0',
            'floors' => 'required|integer|min:0',
            'external_surface' => 'nullable|numeric|min:0',
            'access_code' => 'nullable|string',
            'entry_instructions' => 'nullable|string',
            'photos' => 'nullable|array',
            'photos.*' => [
                'file',
                'max:'.UploadHelper::propertyPhotoMaxKb(),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! UploadHelper::isImageUpload($value)) {
                        $fail('Chaque fichier doit être une image.');
                    }
                },
            ],
        ]);

        // Handle Photos
        $currentPhotos = $property->photos ?? [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $currentPhotos[] = $photo->store('properties', 'public');
            }
        }
        $validated['photos'] = $currentPhotos;

        $property->update($validated);

        return redirect()->route('properties.index')->with('success', 'Bien mis à jour.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Property $property)
    {
        if ($request->user()->id !== $property->user_id) {
            abort(403);
        }

        $property->delete();

        return redirect()->route('properties.index')->with('success', 'Bien supprimé.');
    }
}
