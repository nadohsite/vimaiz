<?php

namespace App\Console\Commands;

use App\Models\Mission;
use App\Models\MissionAgent;
use App\Services\MissionService;
use Illuminate\Console\Command;

/**
 * Paiement différé 48h des brigades (cahier des charges "grands espaces",
 * Volet 7, décision utilisateur du 15/10/2026). Libère vers le solde
 * disponible des intervenants les paiements retenus depuis au moins 48h,
 * sauf contestation en cours ou retour rejeté en attente d'arbitrage admin
 * (voir l'action Filament "Débloquer le paiement malgré le retour rejeté"
 * sur MissionResource).
 */
class ReleaseHeldMissionPayouts extends Command
{
    protected $signature = 'vimaiz:release-held-mission-payouts';

    protected $description = "Libère les paiements des intervenants retenus depuis 48h, sauf contestation ou retour rejeté en attente d'arbitrage admin";

    public function __construct(protected MissionService $missionService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $missions = Mission::query()
            ->where('status', Mission::STATUS_COMPLETED)
            ->where('completed_at', '<=', now()->subHours(48))
            ->whereHas('missionAgents', fn ($q) => $q->where('payout_status', MissionAgent::PAYOUT_HELD))
            ->where(function ($query) {
                // Pas de retour en cours, ou retour déjà validé par le
                // client. Un retour "rejeté" (RETURN_REJECTED) ou encore en
                // cours (pending/in_progress/completed) reste volontairement
                // exclu : le paiement ne part pas automatiquement.
                $query->where('return_requested', false)
                    ->orWhereNull('return_requested')
                    ->orWhere('return_status', Mission::RETURN_VALIDATED);
            })
            ->get();

        $count = 0;

        foreach ($missions as $mission) {
            $this->missionService->releaseEligiblePayoutsFor($mission);
            $count++;
        }

        $this->info("{$count} intervention(s) libérée(s) après le délai de 48h.");

        return self::SUCCESS;
    }
}
