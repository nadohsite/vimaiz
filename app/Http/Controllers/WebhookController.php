<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Wallet;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class WebhookController extends Controller
{
    public function handleStripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('cashier.webhook.secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
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
                \Log::info('Unhandled Stripe event: ' . $event->type);
        }

        return response()->json(['status' => 'success']);
    }

    protected function handlePaymentIntentSucceeded($paymentIntent)
    {
        $bookingId = $paymentIntent->metadata->booking_id ?? null;

        if (!$bookingId) {
            return;
        }

        $booking = Booking::find($bookingId);

        if ($booking) {
            $booking->update([
                'payment_status' => 'paid',
                'payment_intent_id' => $paymentIntent->id,
                'status' => 'confirmed',
            ]);

            \Log::info('Payment succeeded for booking: ' . $booking->booking_number);
        }
    }

    protected function handlePaymentIntentFailed($paymentIntent)
    {
        $bookingId = $paymentIntent->metadata->booking_id ?? null;

        if (!$bookingId) {
            return;
        }

        $booking = Booking::find($bookingId);

        if ($booking) {
            $booking->update([
                'payment_status' => 'failed',
                'status' => 'cancelled',
            ]);

            \Log::warning('Payment failed for booking: ' . $booking->booking_number);
        }
    }

    protected function handleChargeRefunded($charge)
    {
        $paymentIntentId = $charge->payment_intent;

        $booking = Booking::where('payment_intent_id', $paymentIntentId)->first();

        if ($booking) {
            $booking->update([
                'payment_status' => 'refunded',
                'status' => 'cancelled',
            ]);

            // Deduct from agent's pending balance
            $agentWallet = Wallet::where('user_id', $booking->agent_id)->first();
            if ($agentWallet) {
                $agentEarnings = $booking->service_price ?? $booking->total_price * 0.9;
                $agentWallet->decrement('pending_balance', $agentEarnings);
            }

            \Log::info('Refund processed for booking: ' . $booking->booking_number);
        }
    }
}
