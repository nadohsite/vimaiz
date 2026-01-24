<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Services\MissionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class PaymentController extends Controller
{
    protected MissionService $missionService;

    public function __construct(MissionService $missionService)
    {
        $this->missionService = $missionService;
    }

    public function show(Quote $quote)
    {
        $this->authorize('view', $quote);

        if ($quote->status !== Quote::STATUS_ACCEPTED) {
            return redirect()->route('client.quotes.show', $quote)
                ->with('error', 'Veuillez d\'abord accepter le devis.');
        }

        $quote->load(['serviceRequest.property']);

        Stripe::setApiKey(config('services.stripe.secret'));

        $amount = (int) (($quote->final_price ?? $quote->estimated_price) * 100);

        $paymentIntent = PaymentIntent::create([
            'amount' => $amount,
            'currency' => 'eur',
            'metadata' => [
                'quote_id' => $quote->id,
                'service_request_id' => $quote->service_request_id,
                'client_id' => auth()->id(),
            ],
        ]);

        return Inertia::render('Client/payment/show', [
            'quote' => $quote,
            'clientSecret' => $paymentIntent->client_secret,
            'stripeKey' => config('services.stripe.key'),
        ]);
    }

    public function process(Request $request, Quote $quote)
    {
        $this->authorize('update', $quote);

        $validated = $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $paymentIntent = PaymentIntent::retrieve($validated['payment_intent_id']);

            if ($paymentIntent->status !== 'succeeded') {
                return back()->with('error', 'Le paiement n\'a pas été confirmé.');
            }

            $mission = $this->missionService->createMissionFromQuote($quote);
            $mission = $this->missionService->markAsPaid($mission, $paymentIntent->id);

            return redirect()->route('client.missions.show', $mission)
                ->with('success', 'Paiement effectué avec succès ! Un agent vous sera attribué rapidement.');

        } catch (\Exception $e) {
            return back()->with('error', 'Erreur lors du traitement du paiement: ' . $e->getMessage());
        }
    }
}
