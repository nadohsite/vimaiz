<?php

namespace App\Services;

use App\Models\AgentProfile;
use App\Models\Mission;
use App\Models\User;
use Illuminate\Support\Collection;

class AgentAssignmentService
{
    const WEIGHT_PROXIMITY = 0.40;
    const WEIGHT_INTERNAL_RATING = 0.30;
    const WEIGHT_WORKLOAD = 0.20;
    const WEIGHT_SENIORITY = 0.10;

    public function assignAgentToMission(Mission $mission): ?User
    {
        $eligibleAgents = $this->findEligibleAgents($mission);
        
        if ($eligibleAgents->isEmpty()) {
            return null;
        }

        $scoredAgents = $this->scoreAgents($eligibleAgents, $mission);
        
        $bestAgent = $scoredAgents->sortByDesc('score')->first();
        
        if ($bestAgent) {
            $this->assignAgent($mission, $bestAgent['agent']);
            return $bestAgent['agent'];
        }
        
        return null;
    }

    public function findEligibleAgents(Mission $mission): Collection
    {
        $property = $mission->property;
        
        return User::where('role', 'agent')
            ->where('is_active', true)
            ->whereHas('agentProfile', function ($query) use ($property) {
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
                return !$this->hasConflictingMission($agent, $mission);
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

    public function reassignMission(Mission $mission): ?User
    {
        $previousAgentId = $mission->agent_id;
        
        $mission->update([
            'agent_id' => null,
            'status' => Mission::STATUS_AGENT_REFUSED,
        ]);
        
        $eligibleAgents = $this->findEligibleAgents($mission)
            ->filter(fn ($agent) => $agent->id !== $previousAgentId);
        
        if ($eligibleAgents->isEmpty()) {
            return null;
        }
        
        $scoredAgents = $this->scoreAgents($eligibleAgents, $mission);
        $bestAgent = $scoredAgents->sortByDesc('score')->first();
        
        if ($bestAgent) {
            $this->assignAgent($mission, $bestAgent['agent']);
            return $bestAgent['agent'];
        }
        
        return null;
    }
}
