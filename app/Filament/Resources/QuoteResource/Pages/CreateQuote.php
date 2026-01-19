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
                    // Handle scheduled_time which may be a full datetime or just time
                    $timeOnly = $request->scheduled_time instanceof \Carbon\Carbon 
                        ? $request->scheduled_time->format('H:i:s')
                        : (strlen($request->scheduled_time) > 8 
                            ? \Carbon\Carbon::parse($request->scheduled_time)->format('H:i:s') 
                            : $request->scheduled_time);
                    
                    $scheduledAt = \Carbon\Carbon::parse(
                        $request->scheduled_date->format('Y-m-d') . ' ' . $timeOnly
                    );
                    
                    $calculation = $pricingRule->calculatePrice(
                        $request->property->type,
                        $request->property->surface_area,
                        $request->requested_hours,
                        $scheduledAt,
                        $request->property->postal_code
                    );

                    $this->form->fill([
                        'service_request_id' => $serviceRequestId,
                        'estimated_price' => $calculation['estimated_price'],
                        'commission_rate' => $calculation['commission_rate'],
                        'commission_amount' => $calculation['commission_amount'],
                        'agent_amount' => $calculation['agent_amount'],
                        'status' => 'draft',
                    ]);
                }
            }
        }
    }
}
