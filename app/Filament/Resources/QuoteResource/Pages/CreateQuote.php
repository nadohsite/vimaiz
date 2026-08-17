<?php

namespace App\Filament\Resources\QuoteResource\Pages;

use App\Filament\Resources\QuoteResource;
use App\Models\PricingRule;
use App\Models\Quote;
use App\Models\ServiceRequest;
use App\Services\QuoteCalculationService;
use Filament\Actions\Action;
use Filament\Resources\Pages\CreateRecord;

class CreateQuote extends CreateRecord
{
    protected static string $resource = QuoteResource::class;

    public function mount(): void
    {
        parent::mount();

        $serviceRequestId = request()->query('service_request_id');

        if ($serviceRequestId) {
            $request = ServiceRequest::with('property')->find($serviceRequestId);

            if ($request) {
                $this->form->fill([
                    'service_request_id' => $serviceRequestId,
                    'commission_rate' => PricingRule::getActive()?->platform_commission_rate ?? 20,
                    'status' => Quote::STATUS_SENT,
                ]);
            }
        }
    }

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $final = (float) ($data['final_price'] ?? 0);
        $rate = (float) ($data['commission_rate'] ?? (PricingRule::getActive()?->platform_commission_rate ?? 20));
        $commission = round($final * ($rate / 100), 2);

        $data['estimated_price'] = $data['estimated_price'] ?? $final;
        $data['commission_rate'] = $rate;
        $data['commission_amount'] = $commission;
        $data['agent_amount'] = round($final - $commission, 2);
        $data['status'] = Quote::STATUS_SENT;

        return $data;
    }

    protected function getCreateFormAction(): Action
    {
        return parent::getCreateFormAction()
            ->label('Créer et envoyer');
    }

    protected function afterCreate(): void
    {
        if ($this->record->status === Quote::STATUS_SENT) {
            app(QuoteCalculationService::class)->sendQuote($this->record, auth()->id());
        }
    }
}
