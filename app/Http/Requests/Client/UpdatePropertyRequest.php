<?php

namespace App\Http\Requests\Client;

use App\Models\Property;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        $property = $this->route('property');
        return $this->user()->id === $property->user_id || $this->user()->isAdmin();
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
            'is_active' => ['nullable', 'boolean'],
            'checklist' => ['nullable', 'array'],
            'checklist.*.id' => ['required_with:checklist', 'string', 'max:100'],
            'checklist.*.title' => ['required_with:checklist', 'string', 'max:100'],
            'checklist.*.emoji' => ['nullable', 'string', 'max:16'],
            'checklist.*.items' => ['required_with:checklist', 'array', 'min:1'],
            'checklist.*.items.*.id' => ['required', 'string', 'max:100'],
            'checklist.*.items.*.label' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Le type de bien est obligatoire.',
            'type.in' => 'Le type de bien doit être appartement, maison, villa, chalet ou gîte.',
            'address_line1.required' => 'L\'adresse est obligatoire.',
            'city.required' => 'La ville est obligatoire.',
            'postal_code.required' => 'Le code postal est obligatoire.',
            'postal_code.regex' => 'Le code postal doit contenir 5 chiffres.',
            'surface_area.required' => 'La surface est obligatoire.',
            'surface_area.min' => 'La surface doit être d\'au moins 10 m².',
            'checklist.*.items.*.label.required' => 'Chaque tâche de la checklist doit avoir un libellé.',
        ];
    }
}
