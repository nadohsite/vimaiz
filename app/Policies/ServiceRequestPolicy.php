<?php

namespace App\Policies;

use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ServiceRequestPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ServiceRequest $serviceRequest): bool
    {
        return $user->id === $serviceRequest->client_id || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isClient();
    }

    public function update(User $user, ServiceRequest $serviceRequest): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, ServiceRequest $serviceRequest): bool
    {
        return $user->isAdmin();
    }

    public function cancel(User $user, ServiceRequest $serviceRequest): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $serviceRequest->client_id && $serviceRequest->canBeCancelled();
    }
}
