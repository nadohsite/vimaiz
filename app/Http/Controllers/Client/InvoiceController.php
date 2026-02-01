<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $invoices = Invoice::forUser($user->id)
            ->with(['mission.property'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $stats = [
            'total_invoices' => Invoice::forUser($user->id)->count(),
            'total_paid' => Invoice::forUser($user->id)->paid()->sum('total'),
            'current_year' => Invoice::forUser($user->id)
                ->whereYear('created_at', date('Y'))
                ->sum('total'),
        ];

        return Inertia::render('client/invoices/index', [
            'invoices' => $invoices,
            'stats' => $stats,
        ]);
    }

    public function show(Invoice $invoice): Response
    {
        $this->authorize('view', $invoice);

        $invoice->load(['mission.property', 'user']);

        return Inertia::render('client/invoices/show', [
            'invoice' => $invoice,
        ]);
    }

    public function download(Invoice $invoice)
    {
        $this->authorize('view', $invoice);

        $invoice->load(['mission.property', 'user']);

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
        ]);

        return $pdf->download('facture-' . $invoice->invoice_number . '.pdf');
    }
}
