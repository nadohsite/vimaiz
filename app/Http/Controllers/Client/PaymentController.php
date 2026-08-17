<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\Quote;
use App\Services\MissionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class PaymentController extends Controller
{
    public function __construct(
        protected MissionService $missionService
    ) {}

    public function show(Quote $quote)
    {
        $this->authorize('view', $quote);

        if ($quote->status === Quote::STATUS_PAID || $quote->mission?->isPaid()) {
            $mission = $quote->mission ?? Mission::where('quote_id', $quote->id)->first();
            if ($mission) {
                return redirect()->route('client.missions.show', $mission)
                    ->with('success', 'Cette intervention est déjà payée.');
            }
        }

        if ($quote->status !== Quote::STATUS_ACCEPTED) {
            return redirect()->route('client.quotes.show', $quote)
                ->with('error', 'Veuillez d\'abord accepter le devis.');
        }

        $quote->load(['serviceRequest.property']);

        try {
            $paymentIntent = $this->getOrCreatePaymentIntent($quote);
        } catch (\Exception $e) {
            return redirect()->route('client.quotes.show', $quote)
                ->with('error', 'Impossible d\'initialiser le paiement. Réessayez dans un instant.');
        }

        if ($paymentIntent->status === 'succeeded') {
            $mission = $this->missionService->fulfillPaidQuote($quote, $paymentIntent->id);

            return redirect()->route('client.missions.show', $mission)
                ->with('success', 'Paiement effectué avec succès !');
        }

        return Inertia::render('Client/payment/show', [
            'quote' => $quote,
            'clientSecret' => $paymentIntent->client_secret,
            'stripeKey' => config('services.stripe.key'),
        ]);
    }

    public function return(Request $request)
    {
        $paymentIntentId = $request->query('payment_intent');

        if (! $paymentIntentId) {
            return redirect()->route('client.requests.index')
                ->with('error', 'Aucun paiement trouvé.');
        }

        try {
            return $this->completePaymentIntent($paymentIntentId);
        } catch (\Exception $e) {
            return redirect()->route('client.requests.index')
                ->with('error', 'Erreur lors du traitement du paiement.');
        }
    }

    public function process(Request $request, Quote $quote)
    {
        $this->authorize('view', $quote);

        $validated = $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        try {
            return $this->completePaymentIntent($validated['payment_intent_id'], $quote, $request->expectsJson());
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Erreur lors du traitement du paiement.'], 500);
            }

            return back()->with('error', 'Erreur lors du traitement du paiement.');
        }
    }

    protected function completePaymentIntent(string $paymentIntentId, ?Quote $quote = null, bool $asJson = false)
    {
        $this->configureStripe();

        $paymentIntent = PaymentIntent::retrieve($paymentIntentId);

        if ($paymentIntent->status !== 'succeeded') {
            if ($asJson) {
                return response()->json(['message' => 'Le paiement n\'a pas été confirmé.'], 400);
            }

            return redirect()->route('client.requests.index')
                ->with('error', 'Le paiement n\'a pas été confirmé.');
        }

        $quoteId = $paymentIntent->metadata->quote_id ?? $quote?->id;

        if (! $quoteId) {
            if ($asJson) {
                return response()->json(['message' => 'Devis introuvable.'], 404);
            }

            return redirect()->route('client.requests.index')
                ->with('error', 'Devis introuvable.');
        }

        $resolvedQuote = Quote::findOrFail($quoteId);
        $this->authorize('view', $resolvedQuote);

        $mission = $this->missionService->fulfillPaidQuote($resolvedQuote, $paymentIntent->id);
        $message = $mission->agent_id
            ? 'Paiement effectué. Un intervenant va confirmer votre intervention.'
            : 'Paiement effectué. Nous recherchons un intervenant disponible.';

        if ($asJson) {
            return response()->json([
                'success' => true,
                'redirect' => route('client.missions.show', $mission),
                'message' => $message,
            ]);
        }

        return redirect()->route('client.missions.show', $mission)
            ->with('success', $message);
    }

    protected function getOrCreatePaymentIntent(Quote $quote): PaymentIntent
    {
        $this->configureStripe();

        $amount = (int) round(($quote->final_price ?? $quote->estimated_price) * 100);
        $reusable = ['requires_payment_method', 'requires_confirmation', 'requires_action'];

        if ($quote->payment_intent_id) {
            try {
                $existing = PaymentIntent::retrieve($quote->payment_intent_id);

                if ($existing->status === 'succeeded') {
                    return $existing;
                }

                if (in_array($existing->status, $reusable, true) && (int) $existing->amount === $amount) {
                    return $existing;
                }
            } catch (\Exception) {
                // Payment intent missing or unusable: create a new one.
            }
        }

        $paymentIntent = PaymentIntent::create([
            'amount' => $amount,
            'currency' => config('services.stripe.currency', 'eur'),
            'automatic_payment_methods' => ['enabled' => true],
            'metadata' => [
                'quote_id' => $quote->id,
                'service_request_id' => $quote->service_request_id,
                'client_id' => auth()->id(),
            ],
        ]);

        $quote->update(['payment_intent_id' => $paymentIntent->id]);

        return $paymentIntent;
    }

    protected function configureStripe(): void
    {
        Stripe::setApiKey(config('services.stripe.secret') ?: config('cashier.secret'));
    }
}
