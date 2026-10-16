<?php

namespace App\Policies;

use App\Models\Mission;
use App\Models\MissionAgent;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class MissionPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Mission $mission): bool
    {
        if ((int) $user->id === (int) $mission->client_id
            || (int) $user->id === (int) $mission->agent_id
            || $user->isAdmin()) {
            return true;
        }

        return $user->isAgent() && $mission->isVisibleToAgent($user);
    }

    public function accept(User $user, Mission $mission): bool
    {
        if (! $user->isAgent() || ! $user->is_active || $mission->status !== Mission::STATUS_PENDING_AGENT) {
            return false;
        }

        $profile = $user->agentProfile;
        if ($profile && ($profile->is_banned || $profile->isSuspended())) {
            return false;
        }

        if ($mission->isFullyStaffed()) {
            return false;
        }

        // Source de vérité unique : une ligne mission_agents en attente pour
        // CET agent sur CETTE mission — que le créneau vienne de la mise en
        // relation automatique (AgentAssignmentService::proposeToAvailableAgents)
        // ou d'une attribution manuelle admin (MissionService::assignSpecificAgent).
        // Les deux créent désormais une ligne pending_agent, donc on n'a plus
        // besoin (et on ne doit plus) de re-vérifier l'éligibilité géographique
        // ici : c'était déjà fait avant de proposer le créneau, et le
        // bypass admin en dépendait.
        $hasPendingSlot = $mission->missionAgents()
            ->where('agent_id', $user->id)
            ->where('status', MissionAgent::STATUS_PENDING_AGENT)
            ->exists();

        if (! $hasPendingSlot) {
            return false;
        }

        return ! MissionAgent::where('agent_id', $user->id)
            ->where('status', MissionAgent::STATUS_PENDING_AGENT)
            ->where('mission_id', '!=', $mission->id)
            ->exists();
    }

    public function refuse(User $user, Mission $mission): bool
    {
        if ($this->accept($user, $mission)) {
            return true;
        }

        // Brigades : tout intervenant ayant accepté son créneau peut se
        // désister, pas seulement le référent (cf. MissionService::agentRefuseMission
        // qui gère déjà le réassignement du rôle de référent le cas échéant).
        return $mission->missionAgents()
            ->where('agent_id', $user->id)
            ->where('status', MissionAgent::STATUS_ACCEPTED)
            ->exists();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Mission $mission): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Mission $mission): bool
    {
        return $user->isAdmin();
    }

    public function start(User $user, Mission $mission): bool
    {
        if (! $mission->canStart()) {
            return false;
        }

        // Brigades : n'importe quel agent ayant accepté son créneau peut
        // démarrer (arrivée géolocalisée), pas seulement le référent.
        return $mission->missionAgents()
            ->where('agent_id', $user->id)
            ->where('status', MissionAgent::STATUS_ACCEPTED)
            ->exists();
    }

    public function uploadPhotos(User $user, Mission $mission): bool
    {
        return $user->id === $mission->agent_id
            && in_array($mission->status, [
                Mission::STATUS_AGENT_ACCEPTED,
                Mission::STATUS_IN_PROGRESS,
                Mission::STATUS_PHOTOS_BEFORE,
                Mission::STATUS_PHOTOS_AFTER,
            ]);
    }

    public function complete(User $user, Mission $mission): bool
    {
        return $user->id === $mission->agent_id && $mission->canComplete();
    }

    public function cancel(User $user, Mission $mission): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id === $mission->client_id) {
            return in_array($mission->status, [
                Mission::STATUS_PENDING_AGENT,
                Mission::STATUS_AGENT_ACCEPTED,
            ]);
        }

        return false;
    }

    public function review(User $user, Mission $mission): bool
    {
        return $user->isAdmin() && $mission->status === Mission::STATUS_COMPLETED;
    }
}
