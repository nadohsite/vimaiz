<?php

namespace App\Http\Requests\Agent;

use App\Models\AgentProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WithdrawRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAgent() ?? false;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:1'],
            'payment_method' => [
                'required',
                'string',
                Rule::in([
                    AgentProfile::PAYOUT_BANK_TRANSFER,
                    AgentProfile::PAYOUT_MOBILE_MONEY,
                ]),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'Le montant est obligatoire.',
            'amount.numeric' => 'Le montant doit être un nombre.',
            'amount.min' => 'Le montant minimum est de 1 €.',
            'payment_method.required' => 'Choisissez un mode de paiement.',
            'payment_method.in' => 'Le mode de paiement n\'est pas valide.',
        ];
    }
}
