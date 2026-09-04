<?php

namespace App\Http\Requests\Agent;

use App\Models\AgentProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMobileMoneyDetailsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAgent() ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'mobile_money_phone' => AgentProfile::normalizeMobileMoneyPhone($this->input('mobile_money_phone')),
            'mobile_money_account_name' => is_string($this->input('mobile_money_account_name'))
                ? trim($this->input('mobile_money_account_name'))
                : $this->input('mobile_money_account_name'),
        ]);
    }

    public function rules(): array
    {
        return [
            'mobile_money_provider' => ['required', 'string', Rule::in(array_keys(AgentProfile::MOBILE_MONEY_PROVIDERS))],
            'mobile_money_phone' => ['required', 'string', 'min:10', 'max:20', 'regex:/^(\+33|0)[67][0-9]{8}$/'],
            'mobile_money_account_name' => ['required', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'mobile_money_provider.required' => 'Le fournisseur Mobile Money est obligatoire.',
            'mobile_money_provider.in' => 'Le fournisseur Mobile Money n\'est pas valide.',
            'mobile_money_phone.required' => 'Le numéro Mobile Money est obligatoire.',
            'mobile_money_phone.regex' => 'Indiquez un numéro de mobile français valide (06/07 ou +33).',
            'mobile_money_phone.min' => 'Indiquez un numéro de mobile français valide (06/07 ou +33).',
            'mobile_money_account_name.required' => 'Le nom du titulaire est obligatoire.',
        ];
    }
}
