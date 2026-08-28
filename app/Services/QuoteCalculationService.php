<?php

namespace App\Services;

use App\Models\PricingRule;
use App\Models\Property;
use App\Models\Quote;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Notifications\NewQuoteNotification;
use App\Notifications\QuoteAcceptedNotification;
use App\Notifications\QuoteRefusedNotification;
use App\Support\ScheduledTime;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

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

        if (! $property) {
            throw new \Exception('Property not found for service request');
        }

        if (! $this->pricingRule) {
            throw new \Exception('No active pricing rule found');
        }

        $scheduledAt = ScheduledTime::combine(
            $request->scheduled_date,
            $request->scheduled_time
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

        $this->notifyAfterCommit($quote, function (Quote $fresh) {
            $client = $fresh->serviceRequest?->client;
            if ($client) {
                $client->notify(new NewQuoteNotification($fresh));
            }
        }, 'new_quote');

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

        $this->notifyAfterCommit($quote, function (Quote $fresh) {
            foreach (User::admins()->get() as $admin) {
                $admin->notify(new QuoteAcceptedNotification($fresh));
            }
        }, 'quote_accepted');

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

        $this->notifyAfterCommit($quote, function (Quote $fresh) {
            foreach (User::admins()->get() as $admin) {
                $admin->notify(new QuoteRefusedNotification($fresh));
            }
        }, 'quote_refused');

        return $quote->fresh();
    }

    /**
     * @param  callable(Quote): void  $callback
     */
    protected function notifyAfterCommit(Quote $quote, callable $callback, string $type): void
    {
        $dispatch = function () use ($quote, $callback, $type): void {
            $fresh = $quote->fresh(['serviceRequest.client', 'serviceRequest.property']);
            if (! $fresh) {
                return;
            }

            try {
                $callback($fresh);
            } catch (Throwable $e) {
                Log::error('Failed to emit quote notification', [
                    'type' => $type,
                    'quote_id' => $fresh->id,
                    'error' => $e->getMessage(),
                ]);
            }
        };

        if (DB::transactionLevel() > 0) {
            DB::afterCommit($dispatch);
        } else {
            $dispatch();
        }
    }

    public function getEstimateForProperty(
        Property $property,
        float $requestedHours,
        Carbon $scheduledAt
    ): array {
        if (! $this->pricingRule) {
            throw new \Exception('No active pricing rule found');
        }

        $calculation = $this->pricingRule->calculatePrice(
            $property->type,
            $property->surface_area,
            (int) $requestedHours,
            $scheduledAt,
            $property->postal_code
        );

        // Retourner une fourchette de prix (±10%)
        $price = $calculation['estimated_price'];
        $margin = round($price * 0.10, 2);

        return [
            'min' => round($price - $margin, 2),
            'max' => round($price + $margin, 2),
            'estimated_price' => $price,
            'details' => $calculation,
        ];
    }
}
