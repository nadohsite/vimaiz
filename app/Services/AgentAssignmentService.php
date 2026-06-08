<?php

namespace App\Services;

use App\Models\AgentProfile;
use App\Models\Mission;
use App\Models\MissionInvitation;
use App\Models\User;
use App\Notifications\MissionAssignedNotification;
use Illuminate\Support\Collection;

class AgentAssignmentService
{
    const WEIGHT_PROXIMITY = 0.40;
    const WEIGHT_INTERNAL_RATING = 0.30;
    const WEIGHT_WORKLOAD = 0.20;
    const WEIGHT_SENIORITY = 0.10;

    /**
     * Propose a mission to the top N eligible agents simultaneously.
     * The first agent to accept wins; others are withdrawn automatically.
     */
    public function proposeMissionToAgents(
        Mission $mission,
        ?int $count = null,
        array $excludeAgentIds = []
    ): Collection {
        $count = $count ?? (int) config('vimaiz.mission.agents_per_proposal', 5);

        $excludeAgentIds = array_unique(array_merge(
            $excludeAgentIds,
            $this->getExcludedAgentIds($mission)
        ));

        $eligibleAgents = $this->findEligibleAgents($mission, $excludeAgentIds);

        if ($eligibleAgents->isEmpty()) {
            return collect();
        }

        $scoredAgents = $this->scoreAgents($eligibleAgents, $mission);
        $selectedAgents = $scoredAgents->sortByDesc('score')->take($count);

        $invitations = collect();

        foreach ($selectedAgents as $item) {
            $invitation = MissionInvitation::create([
                'mission_id' => $mission->id,
                'agent_id' => $item['agent']->id,
                'status' => MissionInvitation::STATUS_PENDING,
                'notified_at' => now(),
            ]);

            $item['agent']->notify(new MissionAssignedNotification($mission->fresh()));
            $invitations->push($invitation);
        }

        $mission->update([
            'status' => Mission::STATUS_PENDING_AGENT,
            'agent_id' => null,
            'agent_notified_at' => now(),
            'assignment_attempts' => $mission->assignment_attempts + 1,
        ]);

        return $invitations;
    }

    /**
     * Re-propose when no pending invitations remain and no agent is assigned.
     */
    public function reproposeIfNeeded(Mission $mission): void
    {
        $this->fillPendingInvitationSlots($mission);
    }

    /**
     * Maintient le pool d'agents invités : après un refus, comble les places libres
     * avec de nouveaux agents éligibles (jamais invités sur cette mission).
     */
    public function fillPendingInvitationSlots(Mission $mission): int
    {
        $mission->refresh();

        if ($mission->agent_id !== null) {
            return 0;
        }

        if ($mission->status === Mission::STATUS_AGENT_REFUSED) {
            $mission->update([
                'status' => Mission::STATUS_PENDING_AGENT,
                'agent_id' => null,
            ]);
        }

        if ($mission->status !== Mission::STATUS_PENDING_AGENT) {
            return 0;
        }

        $targetCount = (int) config('vimaiz.mission.agents_per_proposal', 5);
        $pendingCount = $mission->pendingInvitations()->count();
        $slotsToFill = max(0, $targetCount - $pendingCount);

        if ($slotsToFill === 0) {
            return 0;
        }

        return $this->proposeMissionToAgents($mission, $slotsToFill)->count();
    }

    /**
     * When the winning agent declines before start, reactivate withdrawn invitations.
     */
    public function reactivateWithdrawnInvitations(Mission $mission): bool
    {
        $withdrawn = $mission->invitations()
            ->where('status', MissionInvitation::STATUS_WITHDRAWN)
            ->with('agent')
            ->get();

        if ($withdrawn->isEmpty()) {
            return false;
        }

        foreach ($withdrawn as $invitation) {
            $invitation->update([
                'status' => MissionInvitation::STATUS_PENDING,
                'responded_at' => null,
            ]);

            if ($invitation->agent) {
                $invitation->agent->notify(new MissionAssignedNotification($mission->fresh()));
            }
        }

        $mission->update([
            'status' => Mission::STATUS_PENDING_AGENT,
            'agent_notified_at' => now(),
        ]);

        return true;
    }

    protected function getExcludedAgentIds(Mission $mission): array
    {
        return $mission->invitations()->pluck('agent_id')->all();
    }

    public function findEligibleAgents(Mission $mission, array $excludeAgentIds = []): Collection
    {
        $property = $mission->property;

        return User::where('role', 'agent')
            ->where('is_active', true)
            ->when(! empty($excludeAgentIds), fn ($query) => $query->whereNotIn('id', $excludeAgentIds))
            ->whereHas('agentProfile', function ($query) {
                $query->where('verification_status', 'verified')
                    ->where('is_available', true)
                    ->where('has_own_equipment', true)
                    ->where('has_driving_license', true)
                    ->where('has_vehicle', true)
                    ->where(function ($q) {
                        $q->whereNull('suspended_until')
                            ->orWhere('suspended_until', '<', now());
                    });
            })
            ->with('agentProfile')
            ->get()
            ->filter(function ($agent) use ($property) {
                return $agent->agentProfile->coversZone($property->postal_code);
            })
            ->filter(function ($agent) use ($mission) {
                return ! $this->hasConflictingMission($agent, $mission)
                    && ! $this->hasConflictingPendingInvitation($agent, $mission);
            });
    }

    protected function hasConflictingMission(User $agent, Mission $mission): bool
    {
        $scheduledAt = $mission->scheduled_at;
        $endTime = $scheduledAt->copy()->addHours($mission->duration_hours);

        return Mission::where('agent_id', $agent->id)
            ->whereIn('status', ['agent_accepted', 'in_progress', 'photos_before', 'photos_after'])
            ->where(function ($query) use ($scheduledAt, $endTime) {
                $query->whereBetween('scheduled_at', [$scheduledAt, $endTime])
                    ->orWhere(function ($q) use ($scheduledAt, $endTime) {
                        $q->where('scheduled_at', '<=', $scheduledAt)
                            ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_hours HOUR) >= ?', [$scheduledAt]);
                    });
            })
            ->exists();
    }

    protected function hasConflictingPendingInvitation(User $agent, Mission $mission): bool
    {
        $scheduledAt = $mission->scheduled_at;
        $endTime = $scheduledAt->copy()->addHours($mission->duration_hours);

        return MissionInvitation::where('agent_id', $agent->id)
            ->where('status', MissionInvitation::STATUS_PENDING)
            ->where('mission_id', '!=', $mission->id)
            ->whereHas('mission', function ($query) use ($scheduledAt, $endTime) {
                $query->where('status', Mission::STATUS_PENDING_AGENT)
                    ->where(function ($q) use ($scheduledAt, $endTime) {
                        $q->whereBetween('scheduled_at', [$scheduledAt, $endTime])
                            ->orWhere(function ($inner) use ($scheduledAt) {
                                $inner->where('scheduled_at', '<=', $scheduledAt)
                                    ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_hours HOUR) >= ?', [$scheduledAt]);
                            });
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
}
