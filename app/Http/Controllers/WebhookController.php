<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Invoice;
use App\Models\Mission;
use App\Models\Quote;
use App\Models\Wallet;
use App\Services\MissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class WebhookController extends Controller
{
    public function __construct(
        protected MissionService $missionService
    ) {}

    public function handleStripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret') ?: config('cashier.webhook.secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentIntentFailed($event->data->object);
                break;

            case 'charge.refunded':
                $this->handleChargeRefunded($event->data->object);
                break;

            default:
                Log::info('Unhandled Stripe event: '.$event->type);
        }

        return response()->json(['status' => 'success']);
    }

    protected function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $quoteId = $paymentIntent->metadata->quote_id ?? null;

        if (! $quoteId) {
            $quoteId = Quote::query()
                ->where('payment_intent_id', $paymentIntent->id)
                ->value('id');
        }

        if ($quoteId) {
            $quote = Quote::find($quoteId);
            if ($quote) {
                $this->missionService->fulfillPaidQuote($quote, $paymentIntent->id);
                Log::info('Payment succeeded for quote: '.$quote->quote_number);

                return;
            }
        }

        $bookingId = $paymentIntent->metadata->booking_id ?? null;

        if (! $bookingId) {
            return;
        }

        $booking = Booking::find($bookingId);

        if ($booking) {
            $booking->update([
                'payment_status' => 'paid',
                'payment_intent_id' => $paymentIntent->id,
                'status' => 'confirmed',
            ]);

            Log::info('Payment succeeded for booking: '.$booking->booking_number);
        }
    }

    protected function handlePaymentIntentFailed($paymentIntent): void
    {
        $bookingId = $paymentIntent->metadata->booking_id ?? null;

        if (! $bookingId) {
            return;
        }

        $booking = Booking::find($bookingId);

        if ($booking) {
            $booking->update([
                'payment_status' => 'failed',
                'status' => 'cancelled',
            ]);

            Log::warning('Payment failed for booking: '.$booking->booking_number);
        }
    }

    protected function handleChargeRefunded($charge): void
    {
        $paymentIntentId = $charge->payment_intent;

        $mission = Mission::query()->where('payment_intent_id', $paymentIntentId)->first();
        if ($mission && $mission->payment_status === Mission::PAYMENT_PAID) {
            $mission->update([
                'payment_status' => Mission::PAYMENT_REFUNDED,
            ]);

            $mission->invoice?->update([
                'status' => Invoice::STATUS_REFUNDED,
            ]);

            $wallet = $mission->agent?->wallet;
            if ($wallet) {
                $credit = $wallet->transactions()
                    ->where('mission_id', $mission->id)
                    ->where('type', 'credit')
                    ->first();

                if ($credit) {
                    try {
                        $wallet->debit(
                            (float) $credit->amount,
                            'Remboursement mission '.$mission->mission_number
                        );
                    } catch (\Exception $e) {
                        Log::warning(
                            'Impossible d\'annuler le crédit wallet pour '.$mission->mission_number.': '.$e->getMessage()
                        );
                    }
                }
            }

            Log::info('Refund processed for mission: '.$mission->mission_number);

            return;
        }

        $booking = Booking::where('payment_intent_id', $paymentIntentId)->first();

        if ($booking) {
            $booking->update([
                'payment_status' => 'refunded',
                'status' => 'cancelled',
            ]);

            $agentWallet = Wallet::where('user_id', $booking->agent_id)->first();
            if ($agentWallet) {
                $agentEarnings = $booking->service_price ?? $booking->total_price * 0.9;
                $agentWallet->decrement('pending_balance', $agentEarnings);
            }

            Log::info('Refund processed for booking: '.$booking->booking_number);
        }
    }
}
