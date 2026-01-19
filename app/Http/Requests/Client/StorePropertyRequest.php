<?php

namespace App\Http\Requests\Client;

use App\Models\Property;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isClient() || $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(array_keys(Property::TYPES))],
            'name' => ['nullable', 'string', 'max:255'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:10', 'regex:/^[0-9]{5}$/'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'surface_area' => ['required', 'numeric', 'min:10', 'max:10000'],
            'bedrooms' => ['nullable', 'integer', 'min:0', 'max:50'],
            'bathrooms' => ['nullable', 'integer', 'min:0', 'max:20'],
            'toilets' => ['nullable', 'integer', 'min:0', 'max:20'],
            'other_rooms' => ['nullable', 'integer', 'min:0', 'max:50'],
            'floors' => ['nullable', 'integer', 'min:0', 'max:10'],
            'external_surface' => ['nullable', 'numeric', 'min:0', 'max:100000'],
            'access_code' => ['nullable', 'string', 'max:50'],
            'entry_instructions' => ['nullable', 'string', 'max:2000'],
            'wifi_code' => ['nullable', 'string', 'max:100'],
            'trash_instructions' => ['nullable', 'string', 'max:1000'],
            'additional_info' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Le type de logement est obligatoire.',
            'type.in' => 'Le type de logement doit être maison, villa ou chalet.',
            'address_line1.required' => 'L\'adresse est obligatoire.',
            'city.required' => 'La ville est obligatoire.',
            'postal_code.required' => 'Le code postal est obligatoire.',
            'postal_code.regex' => 'Le code postal doit contenir 5 chiffres.',
            'surface_area.required' => 'La surface est obligatoire.',
            'surface_area.min' => 'La surface doit être d\'au moins 10 m².',
        ];
    }

    public function attributes(): array
    {
        return [
            'type' => 'type de logement',
            'address_line1' => 'adresse',
            'address_line2' => 'complément d\'adresse',
            'city' => 'ville',
            'postal_code' => 'code postal',
            'surface_area' => 'surface',
            'bedrooms' => 'chambres',
            'bathrooms' => 'salles de bain',
            'toilets' => 'toilettes',
            'other_rooms' => 'autres pièces',
            'floors' => 'étages',
            'external_surface' => 'surface extérieure',
            'access_code' => 'code d\'accès',
            'entry_instructions' => 'instructions d\'entrée',
            'wifi_code' => 'code Wi-Fi',
            'trash_instructions' => 'instructions poubelles',
            'additional_info' => 'informations supplémentaires',
        ];
    }
}
