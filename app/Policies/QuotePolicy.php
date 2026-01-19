<?php

namespace App\Policies;

use App\Models\Quote;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class QuotePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Quote $quote): bool
    {
        return $user->id === $quote->serviceRequest->client_id || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Quote $quote): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Quote $quote): bool
    {
        return $user->isAdmin() && $quote->isDraft();
    }

    public function accept(User $user, Quote $quote): bool
    {
        return $user->id === $quote->serviceRequest->client_id && $quote->canBeAccepted();
    }

    public function refuse(User $user, Quote $quote): bool
    {
        return $user->id === $quote->serviceRequest->client_id && $quote->isSent();
    }
}
