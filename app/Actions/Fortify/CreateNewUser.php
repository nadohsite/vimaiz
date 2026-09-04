<?php

namespace App\Actions\Fortify;

use App\Models\Address;
use App\Models\Property;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
            'role' => ['required', 'string', 'in:client,agent'],
            'phone' => ['required_if:role,agent', 'nullable', 'string', 'max:20'],

            // Agent specific validation
            'agent_type' => ['required_if:role,agent', 'string', 'in:individual,company'],
            'experience_years' => ['required_if:role,agent', 'nullable', 'integer', 'min:0'],
            'max_surface_area' => ['required_if:role,agent', 'nullable', 'string', 'in:small,medium,large,extra'],
            'supported_property_types' => ['required_if:role,agent', 'nullable', 'array'],
            'supported_property_types.*' => [Rule::in(array_keys(Property::TYPES))],
            'street_address' => ['required_if:role,agent', 'nullable', 'string', 'max:255'],
            'city' => ['required_if:role,agent', 'nullable', 'string', 'max:100'],
            'postal_code' => ['required_if:role,agent', 'nullable', 'string', 'max:20'],
            'latitude' => ['required_if:role,agent', 'nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['required_if:role,agent', 'nullable', 'numeric', 'between:-180,180'],
        ], [
            'street_address.required_if' => 'Sélectionnez votre adresse de référence dans la liste.',
            'city.required_if' => 'La ville est obligatoire.',
            'postal_code.required_if' => 'Le code postal est obligatoire.',
            'latitude.required_if' => 'Choisissez une adresse dans la liste pour enregistrer votre position.',
            'longitude.required_if' => 'Choisissez une adresse dans la liste pour enregistrer votre position.',
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => $input['role'],
            'phone' => $input['phone'] ?? null,
            'is_active' => true,
        ]);

        $user->assignRole($input['role']);

        // If agent, create profile with details
        if ($input['role'] === 'agent') {
            // Map surface category to numeric value for backend matching
            $surfaceMap = [
                'small' => 50,
                'medium' => 100,
                'large' => 200,
                'extra' => 9999,
            ];

            $user->agentProfile()->create([
                'type' => $input['agent_type'] ?? 'individual',
                'experience_years' => $input['experience_years'] ?? 0,
                'supported_property_types' => $input['supported_property_types'] ?? [],
                'max_surface_area' => $surfaceMap[$input['max_surface_area'] ?? 'medium'] ?? 100,
                'verification_status' => 'pending',
                'is_available' => true, // Make available by default after onboarding info is provided
            ]);

            Address::create([
                'user_id' => $user->id,
                'label' => 'Localisation de référence',
                'street_address' => $input['street_address'],
                'city' => $input['city'] ?: 'Non précisée',
                'postal_code' => $input['postal_code'] ?? null,
                'country' => 'France',
                'latitude' => $input['latitude'],
                'longitude' => $input['longitude'],
                'is_default' => true,
            ]);
        }

        return $user;
    }
}
