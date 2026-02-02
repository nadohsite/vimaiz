<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture <?php echo e($invoice->invoice_number); ?></title>
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
                    <div class="logo">VIMAIZ</div>
                    <div class="logo-subtitle">Services de ménage professionnels</div>
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
                    <div class="invoice-number"><?php echo e($invoice->invoice_number); ?></div>
                    <div class="invoice-date">Date: <?php echo e($invoice->issued_at->format('d/m/Y')); ?></div>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($invoice->isPaid()): ?>
                        <div class="paid-badge">✓ PAYÉE</div>
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($invoice->paid_at): ?>
                            <div style="font-size: 10px; color: #166534; margin-top: 5px;">
                                le <?php echo e($invoice->paid_at->format('d/m/Y')); ?>

                            </div>
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </td>
            </tr>
        </table>

        <!-- Client Info -->
        <table style="margin-bottom: 40px;">
            <tr>
                <td style="border: none; padding: 0; width: 50%; vertical-align: top;">
                    <h3 style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">Facturé à</h3>
                    <p class="name"><?php echo e($invoice->billing_name ?? $invoice->user->name); ?></p>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($invoice->billing_address): ?>
                        <p><?php echo e($invoice->billing_address); ?></p>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    <p><?php echo e($invoice->billing_email ?? $invoice->user->email); ?></p>
                </td>
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($invoice->mission && $invoice->mission->property): ?>
                <td style="border: none; padding: 0; width: 50%; vertical-align: top;">
                    <h3 style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">Lieu de prestation</h3>
                    <p class="name"><?php echo e($invoice->mission->property->name ?? $invoice->mission->property->type); ?></p>
                    <p><?php echo e($invoice->mission->property->address_line1); ?></p>
                    <p><?php echo e($invoice->mission->property->postal_code); ?> <?php echo e($invoice->mission->property->city); ?></p>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($invoice->mission->scheduled_at): ?>
                        <p style="margin-top: 8px; color: #64748b;">
                            Date: <?php echo e(\Carbon\Carbon::parse($invoice->mission->scheduled_at)->format('d/m/Y à H:i')); ?>

                        </p>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </td>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
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
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($invoice->line_items): ?>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $invoice->line_items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <tr>
                        <td><?php echo e($item['description']); ?></td>
                        <td><?php echo e($item['quantity']); ?> <?php echo e($item['unit'] ?? ''); ?></td>
                        <td><?php echo e(number_format($item['unit_price'], 2, ',', ' ')); ?> €</td>
                        <td><?php echo e(number_format($item['total'], 2, ',', ' ')); ?> €</td>
                    </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                <?php else: ?>
                    <tr>
                        <td><?php echo e($invoice->description ?? 'Prestation de ménage'); ?></td>
                        <td>1</td>
                        <td><?php echo e(number_format($invoice->subtotal, 2, ',', ' ')); ?> €</td>
                        <td><?php echo e(number_format($invoice->subtotal, 2, ',', ' ')); ?> €</td>
                    </tr>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
            <div class="totals-row total">
                <span>Montant total</span>
                <span class="amount"><?php echo e(number_format($invoice->total, 2, ',', ' ')); ?> €</span>
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
<?php /**PATH /Volumes/Robert/projets clients/Stephane/vimaiz/resources/views/pdf/invoice.blade.php ENDPATH**/ ?>