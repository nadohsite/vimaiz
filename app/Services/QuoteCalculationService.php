<?php

namespace App\Services;

use App\Models\PricingRule;
use App\Models\Property;
use App\Models\Quote;
use App\Models\ServiceRequest;
use Carbon\Carbon;

class QuoteCalculationService
{
    protected ?PricingRule $pricingRule;

    public function __construct()
    {
        $this->pricingRule = PricingRule::getActive();
    }

    public function calculateForServiceRequest(ServiceRequest $request): array
    {
        $property = $request->property;
        
        if (!$property) {
            throw new \Exception('Property not found for service request');
        }
        
        if (!$this->pricingRule) {
            throw new \Exception('No active pricing rule found');
        }
        
        $scheduledAt = Carbon::parse(
            $request->scheduled_date->format('Y-m-d') . ' ' . $request->scheduled_time
        );
        
        return $this->pricingRule->calculatePrice(
            $property->type,
            $property->surface_area,
            $request->requested_hours,
            $scheduledAt,
            $property->postal_code
        );
    }

    public function createQuoteForRequest(ServiceRequest $request): Quote
    {
        $calculation = $this->calculateForServiceRequest($request);
        
        $quote = Quote::create([
            'service_request_id' => $request->id,
            'estimated_price' => $calculation['estimated_price'],
            'commission_rate' => $calculation['commission_rate'],
            'commission_amount' => $calculation['commission_amount'],
            'agent_amount' => $calculation['agent_amount'],
            'status' => Quote::STATUS_DRAFT,
            'expires_at' => now()->addDays(7),
        ]);
        
        return $quote;
    }

    public function recalculateQuote(Quote $quote): Quote
    {
        $request = $quote->serviceRequest;
        $calculation = $this->calculateForServiceRequest($request);
        
        $quote->update([
            'estimated_price' => $calculation['estimated_price'],
            'commission_amount' => $calculation['commission_amount'],
            'agent_amount' => $calculation['agent_amount'],
        ]);
        
        if ($quote->final_price) {
            $finalPrice = $quote->final_price;
            $commissionAmount = round($finalPrice * ($quote->commission_rate / 100), 2);
            $quote->update([
                'commission_amount' => $commissionAmount,
                'agent_amount' => round($finalPrice - $commissionAmount, 2),
            ]);
        }
        
        return $quote->fresh();
    }

    public function sendQuote(Quote $quote, int $validatedBy): Quote
    {
        $quote->update([
            'status' => Quote::STATUS_SENT,
            'sent_at' => now(),
            'validated_by' => $validatedBy,
            'expires_at' => now()->addDays(7),
        ]);
        
        $quote->serviceRequest->update([
            'status' => ServiceRequest::STATUS_QUOTE_SENT,
        ]);
        
        return $quote->fresh();
    }

    public function acceptQuote(Quote $quote): Quote
    {
        $quote->update([
            'status' => Quote::STATUS_ACCEPTED,
            'responded_at' => now(),
        ]);
        
        $quote->serviceRequest->update([
            'status' => ServiceRequest::STATUS_QUOTE_ACCEPTED,
        ]);
        
        return $quote->fresh();
    }

    public function refuseQuote(Quote $quote): Quote
    {
        $quote->update([
            'status' => Quote::STATUS_REFUSED,
            'responded_at' => now(),
        ]);
        
        $quote->serviceRequest->update([
            'status' => ServiceRequest::STATUS_QUOTE_REFUSED,
        ]);
        
        return $quote->fresh();
    }

    public function getEstimateForProperty(
        Property $property,
        int $requestedHours,
        Carbon $scheduledAt
    ): array {
        if (!$this->pricingRule) {
            throw new \Exception('No active pricing rule found');
        }
        
        return $this->pricingRule->calculatePrice(
            $property->type,
            $property->surface_area,
            $requestedHours,
            $scheduledAt,
            $property->postal_code
        );
    }
}
