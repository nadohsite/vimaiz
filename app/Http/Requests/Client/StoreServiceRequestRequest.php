<?php

namespace App\Http\Requests\Client;

use App\Models\MissionAnomaly;
use App\Models\Property;
use App\Support\DefaultPropertyChecklist;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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
                    $property = Property::find($value);
                    if ($property && $property->user_id !== $this->user()->id) {
                        $fail('Ce logement ne vous appartient pas.');
                    }
                },
            ],
            'scheduled_date' => ['required', 'date', 'after:today'],
            'scheduled_time' => ['required', 'date_format:H:i'],
            'requested_hours' => ['nullable', 'numeric', 'min:1', 'max:12'],
            'special_instructions' => ['nullable', 'string', 'max:2000'],
            'checklist_section_ids' => ['required', 'array', 'min:1'],
            'checklist_section_ids.*' => ['required', 'string', 'max:100'],
            'checklist_item_ids' => ['required', 'array', 'min:1'],
            'checklist_item_ids.*' => ['required', 'string', 'max:100'],
            'anomaly_id' => ['nullable', 'integer', 'exists:mission_anomalies,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $property = Property::find($this->input('property_id'));
            if (! $property || $property->user_id !== $this->user()->id) {
                return;
            }

            $source = $property->checklist ?: DefaultPropertyChecklist::sections();
            $validSectionIds = [];
            $validItemIds = [];

            foreach ($source as $section) {
                $sectionId = (string) ($section['id'] ?? '');
                if ($sectionId === '') {
                    continue;
                }
                $validSectionIds[$sectionId] = true;
                foreach ($section['items'] ?? [] as $item) {
                    $itemId = (string) ($item['id'] ?? '');
                    if ($itemId !== '') {
                        $validItemIds[$itemId] = $sectionId;
                    }
                }
            }

            foreach ($this->input('checklist_section_ids', []) as $sectionId) {
                if (! isset($validSectionIds[(string) $sectionId])) {
                    $validator->errors()->add(
                        'checklist_section_ids',
                        'Un axe d\'intervention sélectionné est invalide pour ce bien.'
                    );
                    break;
                }
            }

            $selectedSectionIds = array_fill_keys(
                array_map('strval', $this->input('checklist_section_ids', [])),
                true
            );

            foreach ($this->input('checklist_item_ids', []) as $itemId) {
                $itemId = (string) $itemId;
                if (! isset($validItemIds[$itemId])) {
                    $validator->errors()->add(
                        'checklist_item_ids',
                        'Une tâche sélectionnée est invalide pour ce bien.'
                    );
                    break;
                }
                if (! isset($selectedSectionIds[$validItemIds[$itemId]])) {
                    $validator->errors()->add(
                        'checklist_item_ids',
                        'Une tâche sélectionnée n\'appartient pas à un axe choisi.'
                    );
                    break;
                }
            }

            $anomalyId = $this->input('anomaly_id');
            if ($anomalyId) {
                $anomaly = MissionAnomaly::with('mission')->find($anomalyId);
                if (
                    ! $anomaly
                    || ! $anomaly->mission
                    || $anomaly->mission->client_id !== $this->user()->id
                    || (int) $anomaly->property_id !== (int) $this->input('property_id')
                ) {
                    $validator->errors()->add('anomaly_id', 'Cette anomalie ne peut pas être liée à la demande.');
                }
            }
        });
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
            'checklist_section_ids.required' => 'Veuillez sélectionner au moins un axe d\'intervention.',
            'checklist_section_ids.min' => 'Veuillez sélectionner au moins un axe d\'intervention.',
            'checklist_item_ids.required' => 'Veuillez sélectionner au moins une tâche.',
            'checklist_item_ids.min' => 'Veuillez sélectionner au moins une tâche.',
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
            'checklist_section_ids' => 'axes d\'intervention',
            'checklist_item_ids' => 'tâches',
        ];
    }
}
