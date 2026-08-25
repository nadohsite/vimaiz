<?php

namespace App\Filament\Resources\AgentProfileResource\Pages;

use App\Filament\Resources\AgentProfileResource;
use App\Models\AgentProfile;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAgentProfile extends EditRecord
{
    protected static string $resource = AgentProfileResource::class;

    protected function mutateFormDataBeforeFill(array $data): array
    {
        $data['iban'] = $this->record->iban;
        $data['bic'] = $this->record->bic;
        $data['bank_account_holder'] = $this->record->bank_account_holder;

        return $data;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (array_key_exists('iban', $data)) {
            $data['iban'] = AgentProfile::normalizeIban($data['iban']);
        }

        if (array_key_exists('bic', $data)) {
            $data['bic'] = is_string($data['bic']) && trim($data['bic']) !== ''
                ? strtoupper((string) preg_replace('/\s+/', '', $data['bic']))
                : null;
        }

        return $data;
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
        ];
    }
}
