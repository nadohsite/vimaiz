<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    /**
     * Get user's addresses
     */
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses()->get();

        return response()->json($addresses);
    }

    /**
     * Create a new address
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'nullable|string|max:50',
            'street_address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:2',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'instructions' => 'nullable|string',
            'property_type' => 'nullable|in:apartment,house,villa,office',
            'size_sqm' => 'nullable|integer|min:1',
            'is_default' => 'nullable|boolean',
        ]);

        // If this is set as default, unset other defaults
        if ($validated['is_default'] ?? false) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address = $request->user()->addresses()->create($validated);

        return response()->json([
            'message' => 'Address created successfully',
            'address' => $address,
        ], 201);
    }

    /**
     * Get address details
     */
    public function show($id)
    {
        $address = Address::findOrFail($id);

        // Check authorization
        if ($address->user_id !== request()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($address);
    }

    /**
     * Update an address
     */
    public function update(Request $request, $id)
    {
        $address = Address::findOrFail($id);

        // Check authorization
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'label' => 'sometimes|string|max:50',
            'street_address' => 'sometimes|string|max:255',
            'city' => 'sometimes|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:2',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'instructions' => 'nullable|string',
            'property_type' => 'nullable|in:apartment,house,villa,office',
            'size_sqm' => 'nullable|integer|min:1',
            'is_default' => 'nullable|boolean',
        ]);

        // If this is set as default, unset other defaults
        if ($validated['is_default'] ?? false) {
            $request->user()->addresses()->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json([
            'message' => 'Address updated successfully',
            'address' => $address,
        ]);
    }

    /**
     * Delete an address
     */
    public function destroy($id)
    {
        $address = Address::findOrFail($id);

        // Check authorization
        if ($address->user_id !== request()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted successfully']);
    }
}
