<?php

namespace App\Console\Commands;

use App\Models\Mission;
use App\Models\User;
use App\Notifications\WeeklyWorksRecapNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;

class SendWeeklyWorksRecap extends Command
{
    protected $signature = 'vimaiz:send-weekly-recap
                            {--dry-run : Affiche les destinataires sans rien envoyer}';

    protected $description = 'Envoie chaque début de semaine un récapitulatif des interventions à tous les utilisateurs';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $lastWeekStart = now()->subWeek()->startOfWeek();
        $lastWeekEnd = now()->subWeek()->endOfWeek();
        $thisWeekStart = now()->startOfWeek();
        $thisWeekEnd = now()->endOfWeek();

        $weekLabel = $lastWeekStart->translatedFormat('d M') . ' au ' . $lastWeekEnd->translatedFormat('d M Y');

        $sentClients = $this->notifyRole(
            'client',
            $lastWeekStart,
            $lastWeekEnd,
            $thisWeekStart,
            $thisWeekEnd,
            $weekLabel,
            $dryRun,
        );

        $sentAgents = $this->notifyRole(
            'agent',
            $lastWeekStart,
            $lastWeekEnd,
            $thisWeekStart,
            $thisWeekEnd,
            $weekLabel,
            $dryRun,
        );

        $this->info(sprintf(
            '%s — clients: %d | intervenants: %d',
            $dryRun ? '[DRY-RUN]' : 'Envoyé',
            $sentClients,
            $sentAgents,
        ));

        return self::SUCCESS;
    }

    protected function notifyRole(
        string $role,
        $lastWeekStart,
        $lastWeekEnd,
        $thisWeekStart,
        $thisWeekEnd,
        string $weekLabel,
        bool $dryRun,
    ): int {
        $sent = 0;

        User::query()
            ->where('role', $role)
            ->where('is_active', true)
            ->chunkById(100, function ($users) use (
                &$sent,
                $role,
                $lastWeekStart,
                $lastWeekEnd,
                $thisWeekStart,
                $thisWeekEnd,
                $weekLabel,
                $dryRun,
            ) {
                foreach ($users as $user) {
                    $completed = $this->missionsForUser($user, $role)
                        ->where('status', Mission::STATUS_COMPLETED)
                        ->whereBetween('completed_at', [$lastWeekStart, $lastWeekEnd])
                        ->with('property')
                        ->orderBy('completed_at')
                        ->get();

                    $upcoming = $this->missionsForUser($user, $role)
                        ->whereIn('status', [
                            Mission::STATUS_PENDING_AGENT,
                            Mission::STATUS_AGENT_ACCEPTED,
                            Mission::STATUS_IN_PROGRESS,
                        ])
                        ->whereBetween('scheduled_at', [$thisWeekStart, $thisWeekEnd])
                        ->with('property')
                        ->orderBy('scheduled_at')
                        ->get();

                    $completedPayload = $this->mapMissions($completed, $role, 'completed');
                    $upcomingPayload = $this->mapMissions($upcoming, $role, 'upcoming');

                    if ($dryRun) {
                        $this->line(sprintf(
                            '  [%s] %s — terminées: %d | à venir: %d',
                            $role,
                            $user->email,
                            $completedPayload->count(),
                            $upcomingPayload->count(),
                        ));
                    } else {
                        $user->notify(new WeeklyWorksRecapNotification(
                            $completedPayload,
                            $upcomingPayload,
                            $weekLabel,
                            $role,
                        ));
                    }

                    $sent++;
                }
            });

        return $sent;
    }

    protected function missionsForUser(User $user, string $role)
    {
        return Mission::query()->when(
            $role === 'agent',
            fn ($q) => $q->where('agent_id', $user->id),
            fn ($q) => $q->where('client_id', $user->id),
        );
    }

    /**
     * @return Collection<int, object>
     */
    protected function mapMissions(Collection $missions, string $role, string $type): Collection
    {
        return $missions->map(function (Mission $mission) use ($role, $type) {
            $property = $mission->property;
            $propertyLabel = $property
                ? ($property->name ?: trim(($property->type ?? 'Logement') . ' — ' . ($property->city ?? '')))
                : 'Logement';

            $amount = $role === 'agent'
                ? (float) $mission->agent_payout
                : (float) $mission->total_price;

            return (object) [
                'mission_number' => $mission->mission_number,
                'property_label' => $propertyLabel,
                'completed_at_label' => $type === 'completed' && $mission->completed_at
                    ? $mission->completed_at->format('d/m/Y')
                    : null,
                'scheduled_at_label' => $type === 'upcoming' && $mission->scheduled_at
                    ? $mission->scheduled_at->format('d/m/Y à H:i')
                    : null,
                'amount_label' => number_format($amount, 2, ',', ' ') . ' €',
            ];
        });
    }
}
