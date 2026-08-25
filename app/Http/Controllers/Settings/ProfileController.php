<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Address;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $address = $user->isAgent()
            ? ($user->referenceAddress() ?? $user->addresses()->orderByDesc('is_default')->first())
            : null;

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'referenceAddress' => $address,
            'extendedRadiusKm' => (float) config('vimaiz.matching.extended_radius_km', 150),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        
        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }
        
        $user->fill($request->safe()->except([
            'avatar',
            'street_address',
            'city',
            'postal_code',
            'latitude',
            'longitude',
        ]));

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($user->isAgent()) {
            $this->updateAgentReferenceLocation($request);
        }

        return to_route('settings.profile.edit')->with('success', 'Profil mis a jour.');
    }

    protected function updateAgentReferenceLocation(ProfileUpdateRequest $request): void
    {
        $latitude = $request->validated('latitude');
        $longitude = $request->validated('longitude');
        $street = $request->validated('street_address');

        if ($latitude === null || $longitude === null || empty($street)) {
            return;
        }

        $user = $request->user();
        $address = $user->referenceAddress()
            ?? $user->addresses()->orderByDesc('is_default')->first();

        $user->addresses()->update(['is_default' => false]);

        $payload = [
            'label' => 'Localisation de référence',
            'street_address' => $street,
            'city' => $request->validated('city') ?: 'Non précisée',
            'postal_code' => $request->validated('postal_code'),
            'country' => 'France',
            'latitude' => $latitude,
            'longitude' => $longitude,
            'is_default' => true,
        ];

        if ($address) {
            $address->update($payload);
        } else {
            Address::create(['user_id' => $user->id, ...$payload]);
        }
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        // Si l'utilisateur a un mot de passe, le valider
        if ($user->password) {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
