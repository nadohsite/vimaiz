<?php

namespace App\Filament\Resources\QuoteResource\Pages;

use App\Filament\Resources\QuoteResource;
use App\Models\ServiceRequest;
use App\Models\PricingRule;
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
            
            if ($request && $request->property) {
                $pricingRule = PricingRule::getActive();
                
                if ($pricingRule) {
                    $this->form->fill([
                        'service_request_id' => $serviceRequestId,
                        'commission_rate' => $pricingRule->platform_commission_rate,
                        'status' => 'draft',
                    ]);
                }
            }
        }
    }
}
