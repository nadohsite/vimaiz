<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Services\QuoteCalculationService;
use Inertia\Inertia;

class QuoteController extends Controller
{
    public function __construct(
        protected QuoteCalculationService $quoteService
    ) {}

    public function show(Quote $quote)
    {
        $quote->load(['serviceRequest.property']);

        if (! $quote->serviceRequest) {
            return redirect()->route('notifications.index')
                ->with('info', 'Ce devis n\'est plus disponible.');
        }

        $this->authorize('view', $quote);

        return Inertia::render('Client/quotes/show', [
            'quote' => $quote,
        ]);
    }

    public function accept(Quote $quote)
    {
        $this->authorize('update', $quote);

        if (! $quote->canBeAccepted()) {
            return back()->with('error', 'Ce devis ne peut plus être accepté.');
        }

        $this->quoteService->acceptQuote($quote);

        return redirect()->route('client.payment.show', $quote)
            ->with('success', 'Devis accepté. Procédez au paiement pour confirmer votre réservation.');
    }

    public function refuse(Quote $quote)
    {
        $this->authorize('update', $quote);

        if ($quote->status !== Quote::STATUS_SENT) {
            return back()->with('error', 'Ce devis ne peut plus être refusé.');
        }

        $this->quoteService->refuseQuote($quote);

        return redirect()->route('client.requests.index')
            ->with('info', 'Devis refusé.');
    }
}
