<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->addresses()->orderBy('is_default', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'nullable|string|max:50',
            'street_address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'instructions' => 'nullable|string|max:1000',
            'property_type' => 'nullable|string|max:50',
            'size_sqm' => 'nullable|integer|min:0',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validated['is_default'] ?? false) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        // Set default country if missing (fallback logic, though validation requires it)
        if (empty($validated['country'])) {
            $validated['country'] = 'Maroc';
        }

        $address = $request->user()->addresses()->create($validated);

        return back()->with('success', 'Adresse ajoutée avec succès.');
    }

    public function update(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'label' => 'nullable|string|max:50',
            'street_address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'instructions' => 'nullable|string|max:1000',
            'property_type' => 'nullable|string|max:50',
            'size_sqm' => 'nullable|integer|min:0',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validated['is_default'] ?? false) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return back()->with('success', 'Adresse mise à jour.');
    }

    public function destroy(Address $address)
    {
        if ($address->user_id !== request()->user()->id) {
            abort(403);
        }

        $address->delete();

        return back()->with('success', 'Adresse supprimée.');
    }
}
