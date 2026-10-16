<?php

namespace App\Services;

use App\Models\AgentProfile;
use App\Models\Mission;
use App\Models\MissionAgent;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class AgentAssignmentService
{
    public function __construct(
        protected GeographicMatchingService $geoMatching
    ) {}

    const WEIGHT_PROXIMITY = 0.40;

    const WEIGHT_INTERNAL_RATING = 0.30;

    const WEIGHT_WORKLOAD = 0.20;

    const WEIGHT_SENIORITY = 0.10;

    /**
     * Propose la mission à des agents éligibles, en tenant compte des
     * créneaux de brigade encore ouverts (missions.required_agents — voir
     * le plan technique "brigades multi-agents" du projet Claude Vimaiz).
     * Pour une mission mono-agent (required_agents = 1, le cas de tout le
     * parc actuel sous 200 m²), ceci se comporte exactement comme avant :
     * un seul créneau, proposé à plusieurs agents en même temps ("premier
     * arrivé, premier servi").
     */
    public function proposeToAvailableAgents(Mission $mission, ?int $exceptAgentId = null): Collection
    {
        $openSlots = $mission->openSlotsCount();

        if ($openSlots <= 0) {
            return collect();
        }

        $agents = $this->findEligibleAgents($mission);

        if ($exceptAgentId) {
            $agents = $agents->reject(fn (User $agent) => $agent->id === $exceptAgentId);
        }

        // On notifie TOUS les agents éligibles trouvés, comme le faisait déjà
        // la version mono-agent pour son unique créneau ("premier arrivé,
        // premier servi") — pas de plafond arbitraire qui ralentirait
        // l'attribution. Sur une brigade, les openSlots premiers à accepter
        // gagnent un créneau ; les suivants arrivent sur une brigade déjà
        // complète et se font refuser poliment par agentAcceptMission().
        $candidates = $agents->values();

        foreach ($candidates as $agent) {
            MissionAgent::updateOrCreate(
                ['mission_id' => $mission->id, 'agent_id' => $agent->id],
                [
                    'status' => MissionAgent::STATUS_PENDING_AGENT,
                    'notified_at' => now(),
                    'refusal_reason' => null,
                ]
            );
        }

        $mission->update([
            // On ne touche agent_id que s'il n'y a pas déjà un référent
            // (brigade partiellement constituée après un refus partiel).
            'agent_id' => $mission->accepted_agents_count > 0 ? $mission->agent_id : null,
            'status' => Mission::STATUS_PENDING_AGENT,
            'agent_notified_at' => now(),
            'assignment_attempts' => $mission->assignment_attempts + 1,
        ]);

        if ($candidates->isEmpty()) {
            Log::info('No eligible agents to propose mission to', [
                'mission_id' => $mission->id,
                'except_agent_id' => $exceptAgentId,
            ]);
        }

        return $candidates;
    }

    public function assignAgentToMission(Mission $mission): ?User
    {
        $agents = $this->proposeToAvailableAgents($mission);

        return $agents->first();
    }

    public function findEligibleAgents(Mission $mission): Collection
    {
        $mission->loadMissing('property');

        $declinedAgentIds = $mission->declinedAgents()->pluck('users.id');

        // Brigades : un agent déjà proposé/accepté sur CETTE mission ne doit
        // pas être re-proposé pour un autre créneau de la même mission.
        $alreadyInBrigadeIds = $mission->missionAgents()
            ->whereIn('status', MissionAgent::ACTIVE_STATUSES)
            ->pluck('agent_id');

        return User::agents()
            ->where('is_active', true)
            ->whereHas('agentProfile', function ($query) {
                $query->where('is_available', true)
                    ->where(function ($status) {
                        $status->where('is_banned', false)
                            ->orWhereNull('is_banned');
                    })
                    ->where(function ($suspended) {
                        $suspended->whereNull('suspended_until')
                            ->orWhere('suspended_until', '<', now());
                    });
            })
            ->with(['agentProfile', 'addresses'])
            ->get()
            ->reject(fn (User $agent) => $declinedAgentIds->contains($agent->id))
            ->reject(fn (User $agent) => $alreadyInBrigadeIds->contains($agent->id))
            ->reject(fn (User $agent) => $this->hasPendingMission($agent))
            ->reject(fn (User $agent) => $mission->scheduled_at && $this->hasConflictingMission($agent, $mission))
            ->filter(fn (User $agent) => $this->geoMatching->isGeographicallyEligible($agent, $mission))
            ->values();
    }

    protected function hasPendingMission(User $agent): bool
    {
        $hasPendingAsLead = Mission::where('agent_id', $agent->id)
            ->where('status', Mission::STATUS_PENDING_AGENT)
            ->exists();

        if ($hasPendingAsLead) {
            return true;
        }

        // Brigades : l'agent peut aussi avoir une proposition en attente de
        // réponse sur une mission dont il n'est pas (encore) le référent.
        return MissionAgent::where('agent_id', $agent->id)
            ->where('status', MissionAgent::STATUS_PENDING_AGENT)
            ->exists();
    }

    protected function hasConflictingMission(User $agent, Mission $mission): bool
    {
        $scheduledAt = $mission->scheduled_at;
        $endTime = $scheduledAt->copy()->addHours($mission->duration_hours);

        return Mission::where('agent_id', $agent->id)
            ->whereIn('status', ['agent_accepted', 'in_progress', 'photos_before', 'photos_after'])
            ->where(function ($query) use ($scheduledAt, $endTime) {
                $query->whereBetween('scheduled_at', [$scheduledAt, $endTime])
                    ->orWhere(function ($q) use ($scheduledAt) {
                        $q->where('scheduled_at', '<=', $scheduledAt)
                            ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_hours HOUR) >= ?', [$scheduledAt]);
                    });
            })
            ->exists();
    }

    protected function scoreAgents(Collection $agents, Mission $mission): Collection
    {
        $property = $mission->property;

        return $agents->map(function ($agent) use ($property, $mission) {
            $profile = $agent->agentProfile;

            $proximityScore = $this->calculateProximityScore($profile, $property);
            $ratingScore = $this->calculateRatingScore($profile);
            $workloadScore = $this->calculateWorkloadScore($agent, $mission->scheduled_at);
            $seniorityScore = $this->calculateSeniorityScore($profile);

            $totalScore =
                ($proximityScore * self::WEIGHT_PROXIMITY) +
                ($ratingScore * self::WEIGHT_INTERNAL_RATING) +
                ($workloadScore * self::WEIGHT_WORKLOAD) +
                ($seniorityScore * self::WEIGHT_SENIORITY);

            return [
                'agent' => $agent,
                'profile' => $profile,
                'score' => $totalScore,
                'breakdown' => [
                    'proximity' => $proximityScore,
                    'rating' => $ratingScore,
                    'workload' => $workloadScore,
                    'seniority' => $seniorityScore,
                ],
            ];
        });
    }

    protected function calculateProximityScore(AgentProfile $profile, $property): float
    {
        if (empty($profile->covered_zones)) {
            return 0.5;
        }

        $postalPrefix = substr($property->postal_code, 0, 2);

        if (in_array($property->postal_code, $profile->covered_zones)) {
            return 1.0;
        }

        if (in_array($postalPrefix, $profile->covered_zones)) {
            return 0.8;
        }

        return 0.5;
    }

    protected function calculateRatingScore(AgentProfile $profile): float
    {
        $rating = $profile->internal_rating ?? 3.0;

        return min(1.0, $rating / 5.0);
    }

    protected function calculateWorkloadScore(User $agent, $scheduledAt): float
    {
        $weekStart = $scheduledAt->copy()->startOfWeek();
        $weekEnd = $scheduledAt->copy()->endOfWeek();

        $missionsThisWeek = Mission::where('agent_id', $agent->id)
            ->whereBetween('scheduled_at', [$weekStart, $weekEnd])
            ->whereNotIn('status', ['cancelled', 'agent_refused'])
            ->count();

        $maxMissionsPerWeek = 15;

        return max(0, 1.0 - ($missionsThisWeek / $maxMissionsPerWeek));
    }

    protected function calculateSeniorityScore(AgentProfile $profile): float
    {
        $completedMissions = $profile->missions_completed ?? 0;

        if ($completedMissions >= 100) {
            return 1.0;
        } elseif ($completedMissions >= 50) {
            return 0.8;
        } elseif ($completedMissions >= 20) {
            return 0.6;
        } elseif ($completedMissions >= 5) {
            return 0.4;
        }

        return 0.2;
    }

    protected function assignAgent(Mission $mission, User $agent): void
    {
        $mission->update([
            'agent_id' => $agent->id,
            'status' => Mission::STATUS_PENDING_AGENT,
            'agent_notified_at' => now(),
            'assignment_attempts' => $mission->assignment_attempts + 1,
        ]);
    }

    public function reassignMission(Mission $mission): Collection
    {
        $previousAgentId = $mission->agent_id;

        return $this->proposeToAvailableAgents($mission, $previousAgentId);
    }
}
