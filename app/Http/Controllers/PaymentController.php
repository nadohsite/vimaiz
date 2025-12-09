<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Wallet;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class PaymentController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);
        
        // Ensure user owns this booking
        if ($booking->client_id !== $request->user()->id) {
            abort(403);
        }

        Stripe::setApiKey(config('cashier.secret'));

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $booking->total_price * 100, // Convert to cents
                'currency' => 'mad',
                'metadata' => [
                    'booking_id' => $booking->id,
                    'booking_number' => $booking->booking_number,
                    'client_id' => $booking->client_id,
                    'agent_id' => $booking->agent_id,
                ],
                'description' => 'Booking #' . $booking->booking_number,
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'paymentIntentId' => $paymentIntent->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function confirmPayment(Request $request)
    {
        $validated = $request->validate([
            'payment_intent_id' => 'required|string',
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);

        try {
            Stripe::setApiKey(config('cashier.secret'));
            $paymentIntent = PaymentIntent::retrieve($validated['payment_intent_id']);

            if ($paymentIntent->status === 'succeeded') {
                // Update booking status
                $booking->update([
                    'payment_status' => 'paid',
                    'payment_intent_id' => $paymentIntent->id,
                ]);

                // Move funds to agent's pending balance (escrow)
                $agentWallet = Wallet::firstOrCreate(
                    ['user_id' => $booking->agent_id],
                    ['balance' => 0, 'pending_balance' => 0, 'total_earned' => 0]
                );

                $agentEarnings = $booking->service_price ?? $booking->total_price * 0.9;
                $agentWallet->increment('pending_balance', $agentEarnings);

                return response()->json([
                    'success' => true,
                    'booking' => $booking,
                ]);
            }

            return response()->json(['error' => 'Payment not completed'], 400);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
