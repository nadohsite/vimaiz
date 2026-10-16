<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

/**
 * DÉSACTIVÉE : cette commande rattrapait des transferts Stripe Connect
 * manqués. Le paiement des intervenants ne passe plus du tout par Stripe
 * Connect (trop de friction d'onboarding côté intervenant) : il se fait
 * désormais par virement SEPA groupé, généré depuis
 * Admin > Finances > Demandes de retrait ("Exporter en virement groupé").
 *
 * Gardée en place (plutôt que supprimée, ce qui n'est pas possible depuis
 * cette session) uniquement pour que `php artisan` ne liste pas une
 * commande fantôme qui plante : elle ne fait plus rien d'autre qu'avertir.
 */
class SyncStripeTransfers extends Command
{
    protected $signature = 'wallet:sync-stripe-transfers {--dry-run}';

    protected $description = 'DÉSACTIVÉE : le paiement des intervenants passe désormais par le virement SEPA groupé, pas par Stripe Connect';

    public function handle(): int
    {
        $this->warn(
            'Cette commande est désactivée : les intervenants sont désormais payés par virement SEPA groupé '
            .'(Admin > Finances > Demandes de retrait > "Exporter en virement groupé"), plus par Stripe Connect.'
        );

        return Command::SUCCESS;
    }
}
