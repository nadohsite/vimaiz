<?php

namespace App\Filament\Resources\QuoteResource\Pages;

use App\Filament\Resources\QuoteResource;
use App\Models\PricingRule;
use App\Models\Quote;
use App\Services\QuoteCalculationService;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditQuote extends EditRecord
{
    protected static string $resource = QuoteResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (($this->record->status ?? null) === Quote::STATUS_PAID) {
            unset($data['status'], $data['final_price'], $data['commission_rate']);

            return $data;
        }

        $final = (float) ($data['final_price'] ?? $this->record->final_price ?? 0);
        $rate = (float) ($data['commission_rate'] ?? $this->record->commission_rate ?? (PricingRule::getActive()?->platform_commission_rate ?? 20));
        $commission = round($final * ($rate / 100), 2);

        $data['commission_amount'] = $commission;
        $data['agent_amount'] = round($final - $commission, 2);

        if (empty($this->record->estimated_price)) {
            $data['estimated_price'] = $final;
        }

        return $data;
    }

    protected function afterSave(): void
    {
        if ($this->record->status === Quote::STATUS_SENT && $this->record->wasChanged('status')) {
            app(QuoteCalculationService::class)->sendQuote($this->record, auth()->id());
        }
    }
}
