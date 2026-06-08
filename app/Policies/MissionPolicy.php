<?php

namespace App\Policies;

use App\Models\Mission;
use App\Models\MissionInvitation;
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
        if ($user->isAdmin() || $user->id === $mission->client_id) {
            return true;
        }

        if ($user->id === $mission->agent_id) {
            return true;
        }

        return $mission->invitations()
            ->where('agent_id', $user->id)
            ->where('status', MissionInvitation::STATUS_PENDING)
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

    public function accept(User $user, Mission $mission): bool
    {
        if ($mission->status !== Mission::STATUS_PENDING_AGENT) {
            return false;
        }

        if ($mission->agent_id === $user->id) {
            return true;
        }

        return $mission->agent_id === null
            && $mission->invitations()
                ->where('agent_id', $user->id)
                ->where('status', MissionInvitation::STATUS_PENDING)
                ->exists();
    }

    public function refuse(User $user, Mission $mission): bool
    {
        if ($mission->invitations()
            ->where('agent_id', $user->id)
            ->where('status', MissionInvitation::STATUS_PENDING)
            ->exists()) {
            return true;
        }

        if ($user->id !== $mission->agent_id) {
            return false;
        }

        if ($mission->status === Mission::STATUS_AGENT_ACCEPTED) {
            return $mission->canStart();
        }

        return $mission->status === Mission::STATUS_PENDING_AGENT;
    }

    public function start(User $user, Mission $mission): bool
    {
        return $user->id === $mission->agent_id && $mission->canStart();
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
