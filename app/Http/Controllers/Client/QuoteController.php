<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Services\MissionService;
use App\Services\QuoteCalculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuoteController extends Controller
{
    protected QuoteCalculationService $quoteService;
    protected MissionService $missionService;

    public function __construct(
        QuoteCalculationService $quoteService,
        MissionService $missionService
    ) {
        $this->quoteService = $quoteService;
        $this->missionService = $missionService;
    }

    public function show(Quote $quote)
    {
        $this->authorize('view', $quote);

        $quote->load(['serviceRequest.property']);

        return Inertia::render('client/quotes/show', [
            'quote' => $quote,
        ]);
    }

    public function accept(Quote $quote)
    {
        $this->authorize('update', $quote);

        if (!$quote->canBeAccepted()) {
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
