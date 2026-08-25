<?php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBankDetailsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAgent() ?? false;
    }

    protected function prepareForValidation(): void
    {
        $iban = $this->input('iban');
        $bic = $this->input('bic');

        $this->merge([
            'iban' => is_string($iban)
                ? strtoupper((string) preg_replace('/\s+/', '', $iban))
                : $iban,
            'bic' => is_string($bic) && trim($bic) !== ''
                ? strtoupper((string) preg_replace('/\s+/', '', $bic))
                : null,
            'bank_account_holder' => is_string($this->input('bank_account_holder'))
                ? trim($this->input('bank_account_holder'))
                : $this->input('bank_account_holder'),
        ]);
    }

    public function rules(): array
    {
        return [
            'bank_account_holder' => ['required', 'string', 'max:100'],
            'iban' => ['required', 'string', 'min:15', 'max:34', 'regex:/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/'],
            'bic' => ['nullable', 'string', 'regex:/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'bank_account_holder.required' => 'Le titulaire du compte est obligatoire.',
            'iban.required' => 'L\'IBAN est obligatoire.',
            'iban.regex' => 'L\'IBAN n\'est pas valide.',
            'iban.min' => 'L\'IBAN n\'est pas valide.',
            'iban.max' => 'L\'IBAN n\'est pas valide.',
            'bic.regex' => 'Le BIC n\'est pas valide.',
        ];
    }
}
