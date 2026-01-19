<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PropertyPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Property $property): bool
    {
        return $user->id === $property->user_id || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isClient() || $user->isAdmin();
    }

    public function update(User $user, Property $property): bool
    {
        return $user->id === $property->user_id || $user->isAdmin();
    }

    public function delete(User $user, Property $property): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $property->user_id && $property->canBeDeleted();
    }

    public function restore(User $user, Property $property): bool
    {
        return $user->id === $property->user_id || $user->isAdmin();
    }

    public function forceDelete(User $user, Property $property): bool
    {
        return $user->isAdmin();
    }
}
