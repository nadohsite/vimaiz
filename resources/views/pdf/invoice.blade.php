<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture {{ $invoice->invoice_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #334155;
        }
        .container {
            padding: 40px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #0284c7;
        }
        .logo-subtitle {
            font-size: 10px;
            color: #64748b;
        }
        .invoice-title {
            text-align: right;
        }
        .invoice-title h1 {
            font-size: 32px;
            color: #0f172a;
            margin-bottom: 5px;
        }
        .invoice-number {
            font-size: 14px;
            color: #64748b;
            font-family: monospace;
        }
        .invoice-date {
            font-size: 11px;
            color: #64748b;
            margin-top: 5px;
        }
        .paid-badge {
            display: inline-block;
            background: #dcfce7;
            color: #166534;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            margin-top: 8px;
        }
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .info-box {
            width: 48%;
        }
        .info-box h3 {
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
        }
        .info-box p {
            margin-bottom: 3px;
        }
        .info-box .name {
            font-weight: bold;
            color: #0f172a;
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th {
            background: #f8fafc;
            padding: 12px;
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            border-bottom: 2px solid #e2e8f0;
        }
        th:last-child, td:last-child {
            text-align: right;
        }
        th:nth-child(2), td:nth-child(2),
        th:nth-child(3), td:nth-child(3) {
            text-align: center;
        }
        td {
            padding: 15px 12px;
            border-bottom: 1px solid #f1f5f9;
        }
        .totals {
            width: 250px;
            margin-left: auto;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        .totals-row.total {
            border-top: 2px solid #e2e8f0;
            margin-top: 8px;
            padding-top: 12px;
            font-size: 16px;
            font-weight: bold;
        }
        .totals-row.total .amount {
            color: #0284c7;
        }
        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
        }
        .footer a {
            color: #0284c7;
        }
        .company-info {
            margin-top: 10px;
            font-size: 9px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <table style="margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
            <tr>
                <td style="border: none; padding: 0;">
                    <div class="logo">
                        <img src="{{ public_path('vimaiz-logo.png') }}" alt="VIMAIZ" style="height: 45px; filter: brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(166deg) brightness(98%) contrast(101%);">
                    </div>
                    <div class="logo-subtitle">Services d'intervention professionnels</div>
                    <div style="margin-top: 15px; font-size: 11px; color: #64748b;">
                        <p>VIMAIZ (anciennement Nettolia)</p>
                        <p>12 rue porte de la ville</p>
                        <p>73330 Le Pont de Beauvoisin, France</p>
                        <p style="margin-top: 8px;">SIRET: 832 759 294 00032</p>
                        <p style="font-size: 9px; color: #94a3b8;">TVA non applicable – article 293B du CGI</p>
                    </div>
                </td>
                <td style="border: none; padding: 0; text-align: right; vertical-align: top;">
                    <h1 style="font-size: 32px; color: #0f172a; margin-bottom: 5px;">FACTURE</h1>
                    <div class="invoice-number">{{ $invoice->invoice_number }}</div>
                    <div class="invoice-date">Date: {{ $invoice->issued_at->format('d/m/Y') }}</div>
                    @if($invoice->isPaid())
                        <div class="paid-badge">✓ PAYÉE</div>
                        @if($invoice->paid_at)
                            <div style="font-size: 10px; color: #166534; margin-top: 5px;">
                                le {{ $invoice->paid_at->format('d/m/Y') }}
                            </div>
                        @endif
                    @endif
                </td>
            </tr>
        </table>

        <!-- Client Info -->
        <table style="margin-bottom: 40px;">
            <tr>
                <td style="border: none; padding: 0; width: 50%; vertical-align: top;">
                    <h3 style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">Facturé à</h3>
                    <p class="name">{{ $invoice->billing_name ?? $invoice->user->name }}</p>
                    @if($invoice->billing_address)
                        <p>{{ $invoice->billing_address }}</p>
                    @endif
                    <p>{{ $invoice->billing_email ?? $invoice->user->email }}</p>
                </td>
                @if($invoice->mission && $invoice->mission->property)
                <td style="border: none; padding: 0; width: 50%; vertical-align: top;">
                    <h3 style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">Lieu de prestation</h3>
                    <p class="name">{{ $invoice->mission->property->name ?? $invoice->mission->property->type }}</p>
                    <p>{{ $invoice->mission->property->address_line1 }}</p>
                    <p>{{ $invoice->mission->property->postal_code }} {{ $invoice->mission->property->city }}</p>
                    @if($invoice->mission->scheduled_at)
                        <p style="margin-top: 8px; color: #64748b;">
                            Date: {{ \Carbon\Carbon::parse($invoice->mission->scheduled_at)->format('d/m/Y à H:i') }}
                        </p>
                    @endif
                </td>
                @endif
            </tr>
        </table>

        <!-- Line Items -->
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @if($invoice->line_items)
                    @foreach($invoice->line_items as $item)
                    <tr>
                        <td>{{ $item['description'] }}</td>
                        <td>{{ $item['quantity'] }} {{ $item['unit'] ?? '' }}</td>
                        <td>{{ number_format($item['unit_price'], 2, ',', ' ') }} €</td>
                        <td>{{ number_format($item['total'], 2, ',', ' ') }} €</td>
                    </tr>
                    @endforeach
                @else
                    <tr>
                        <td>{{ $invoice->description ?? 'Prestation d\'intervention' }}</td>
                        <td>1</td>
                        <td>{{ number_format($invoice->subtotal, 2, ',', ' ') }} €</td>
                        <td>{{ number_format($invoice->subtotal, 2, ',', ' ') }} €</td>
                    </tr>
                @endif
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
            <div class="totals-row total">
                <span>Montant total</span>
                <span class="amount">{{ number_format($invoice->total, 2, ',', ' ') }} €</span>
            </div>
            <div style="font-size: 9px; color: #94a3b8; text-align: right; margin-top: 10px;">
                TVA non applicable – article 293B du Code Général des Impôts
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Merci de votre confiance !</p>
            <p style="margin-top: 5px;">
                Pour toute question concernant cette facture, contactez-nous à
                <a href="mailto:contact@vimaiz.com">contact@vimaiz.com</a>
            </p>
            <div class="company-info">
                <p style="margin-top: 15px;">
                    VIMAIZ - Auto-entrepreneur - SIRET: 832 759 294 00032
                </p>
            </div>
        </div>
    </div>
</body>
</html>
