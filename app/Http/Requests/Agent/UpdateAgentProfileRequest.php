<?php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAgent() ?? false;
    }

    public function rules(): array
    {
        return [
            'siret' => ['required', 'string', 'digits:14'],
            'company_type' => ['required', Rule::in(['auto_entrepreneur', 'societe'])],
            'company_name' => ['nullable', 'string', 'max:255', 'required_if:company_type,societe'],
            'description' => ['nullable', 'string', 'max:2000'],
            'coverage_radius_km' => ['required', 'integer', 'min:5', 'max:50'],
            'has_own_equipment' => ['required', 'boolean'],
            'has_driving_license' => ['required', 'boolean'],
            'has_vehicle' => ['required', 'boolean'],
            'vehicle_type' => ['nullable', 'string', 'max:100', 'required_if:has_vehicle,true'],
        ];
    }

    public function messages(): array
    {
        return [
            'siret.required' => 'Le numéro SIRET est obligatoire.',
            'siret.digits' => 'Le SIRET doit contenir exactement 14 chiffres.',
            'company_name.required_if' => 'Le nom de l\'entreprise est obligatoire pour une société.',
            'vehicle_type.required_if' => 'Indiquez le type de véhicule.',
        ];
    }
}
