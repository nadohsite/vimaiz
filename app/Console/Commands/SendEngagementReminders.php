<?php

namespace App\Console\Commands;

use App\Models\AgentProfile;
use App\Models\Mission;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Notifications\AgentProfileIncompleteReminder;
use App\Notifications\ClientBookingReminder;
use App\Notifications\ClientProfileIncompleteReminder;
use Illuminate\Console\Command;

class SendEngagementReminders extends Command
{
    protected $signature = 'vimaiz:send-reminders
                            {--dry-run : Affiche les destinataires sans rien envoyer}';

    protected $description = 'Relance (toutes les 48h max par utilisateur) : agents au profil incomplet, clients au profil incomplet, clients sans ménage planifié';

    /** Documents obligatoires pour un profil agent complet */
    protected array $requiredAgentDocuments = [
        'id_document' => 'Pièce d\'identité',
        'address_proof' => 'Justificatif de domicile',
        'siret_document' => 'Extrait KBIS ou INSEE',
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $cutoff = now()->subHours(48);

        $sentAgents = $this->remindIncompleteAgents($cutoff, $dryRun);
        $sentClientsProfile = $this->remindIncompleteClients($cutoff, $dryRun);
        $sentClientsBooking = $this->remindClientsToBook($cutoff, $dryRun);

        $this->info(sprintf(
            '%s — agents profil incomplet: %d | clients profil incomplet: %d | clients relance ménage: %d',
            $dryRun ? '[DRY-RUN]' : 'Envoyé',
            $sentAgents,
            $sentClientsProfile,
            $sentClientsBooking,
        ));

        return self::SUCCESS;
    }

    /**
     * Agents dont le profil n'est pas complet (documents manquants,
     * SIRET absent ou vérification non validée).
     */
    protected function remindIncompleteAgents($cutoff, bool $dryRun): int
    {
        $sent = 0;

        User::query()
            ->where('role', 'agent')
            ->where('is_active', true)
            ->where(function ($q) use ($cutoff) {
                $q->whereNull('last_reminder_sent_at')
                    ->orWhere('last_reminder_sent_at', '<=', $cutoff);
            })
            ->with('agentProfile')
            ->chunkById(100, function ($agents) use (&$sent, $dryRun) {
                foreach ($agents as $agent) {
                    $profile = $agent->agentProfile;

                    // Agents bannis : on ne relance pas
                    if ($profile && $profile->is_banned) {
                        continue;
                    }

                    $missing = $this->missingAgentItems($profile);

                    if (empty($missing)) {
                        continue; // profil complet
                    }

                    if ($dryRun) {
                        $this->line("  [agent] {$agent->email} — manque: " . implode(', ', $missing));
                    } else {
                        $agent->notify(new AgentProfileIncompleteReminder($missing));
                        $agent->forceFill(['last_reminder_sent_at' => now()])->save();
                    }

                    $sent++;
                }
            });

        return $sent;
    }

    /**
     * Liste des éléments manquants du profil agent.
     *
     * @return list<string>
     */
    protected function missingAgentItems(?AgentProfile $profile): array
    {
        if (! $profile) {
            return ['Profil agent (informations de base)'];
        }

        $missing = [];

        if (empty($profile->siret)) {
            $missing[] = 'Numéro SIRET';
        }

        foreach ($this->requiredAgentDocuments as $field => $label) {
            if (empty($profile->{$field})) {
                $missing[] = $label;
            }
        }

        // Documents fournis mais jamais soumis/validés
        if (empty($missing) && ! $profile->isVerified()) {
            $missing[] = 'Validation de vos documents (soumettez-les depuis votre espace)';
        }

        return $missing;
    }

    /**
     * Clients sans aucun logement enregistré (profil incomplet).
     */
    protected function remindIncompleteClients($cutoff, bool $dryRun): int
    {
        $sent = 0;

        User::query()
            ->where('role', 'client')
            ->where('is_active', true)
            ->whereDoesntHave('properties')
            ->where(function ($q) use ($cutoff) {
                $q->whereNull('last_reminder_sent_at')
                    ->orWhere('last_reminder_sent_at', '<=', $cutoff);
            })
            ->chunkById(100, function ($clients) use (&$sent, $dryRun) {
                foreach ($clients as $client) {
                    if ($dryRun) {
                        $this->line("  [client profil] {$client->email}");
                    } else {
                        $client->notify(new ClientProfileIncompleteReminder());
                        $client->forceFill(['last_reminder_sent_at' => now()])->save();
                    }

                    $sent++;
                }
            });

        return $sent;
    }

    /**
     * Clients avec logement mais sans demande active ni mission à venir :
     * on les incite à programmer un entretien (des agents sont disponibles).
     */
    protected function remindClientsToBook($cutoff, bool $dryRun): int
    {
        $sent = 0;

        $availableAgentsCount = AgentProfile::query()
            ->verified()
            ->available()
            ->count();

        User::query()
            ->where('role', 'client')
            ->where('is_active', true)
            ->whereHas('properties')
            ->where(function ($q) use ($cutoff) {
                $q->whereNull('last_reminder_sent_at')
                    ->orWhere('last_reminder_sent_at', '<=', $cutoff);
            })
            ->chunkById(100, function ($clients) use (&$sent, $dryRun, $availableAgentsCount) {
                foreach ($clients as $client) {
                    $hasActiveRequest = ServiceRequest::query()
                        ->where('client_id', $client->id)
                        ->whereNotIn('status', [
                            ServiceRequest::STATUS_COMPLETED,
                            ServiceRequest::STATUS_CANCELLED,
                        ])
                        ->exists();

                    if ($hasActiveRequest) {
                        continue;
                    }

                    $hasUpcomingMission = Mission::query()
                        ->whereHas('serviceRequest', fn ($q) => $q->where('client_id', $client->id))
                        ->whereIn('status', ['pending_agent', 'agent_accepted', 'in_progress'])
                        ->exists();

                    if ($hasUpcomingMission) {
                        continue;
                    }

                    if ($dryRun) {
                        $this->line("  [client relance] {$client->email}");
                    } else {
                        $client->notify(new ClientBookingReminder($availableAgentsCount));
                        $client->forceFill(['last_reminder_sent_at' => now()])->save();
                    }

                    $sent++;
                }
            });

        return $sent;
    }
}
