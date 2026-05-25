<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isClient();
    }

    public function rules(): array
    {
        return [
            'property_id' => [
                'required',
                'exists:properties,id',
                function ($attribute, $value, $fail) {
                    $property = \App\Models\Property::find($value);
                    if ($property && $property->user_id !== $this->user()->id) {
                        $fail('Ce logement ne vous appartient pas.');
                    }
                },
            ],
            'scheduled_date' => ['required', 'date', 'after:today'],
            'scheduled_time' => ['required', 'date_format:H:i'],
            'requested_hours' => ['nullable', 'numeric', 'min:1', 'max:12'],
            'special_instructions' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' => 'Veuillez sélectionner un logement.',
            'property_id.exists' => 'Le logement sélectionné n\'existe pas.',
            'scheduled_date.required' => 'La date est obligatoire.',
            'scheduled_date.after' => 'La date doit être dans le futur.',
            'scheduled_time.required' => 'L\'heure est obligatoire.',
            'scheduled_time.date_format' => 'Le format de l\'heure est invalide.',
            'requested_hours.required' => 'La durée est obligatoire.',
            'requested_hours.min' => 'La durée minimum est de 1 heure.',
            'requested_hours.max' => 'La durée maximum est de 12 heures.',
        ];
    }

    public function attributes(): array
    {
        return [
            'property_id' => 'logement',
            'scheduled_date' => 'date',
            'scheduled_time' => 'heure',
            'requested_hours' => 'durée',
            'special_instructions' => 'instructions particulières',
        ];
    }
}
