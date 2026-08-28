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
        return (int) $user->id === (int) $quote->serviceRequest?->client_id || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Quote $quote): bool
    {
        // Admin peut toujours modifier, client peut accepter/refuser si le devis est envoyé
        if ($user->isAdmin()) {
            return true;
        }
        
        return (int) $user->id === (int) $quote->serviceRequest?->client_id &&
               in_array($quote->status, [Quote::STATUS_SENT, Quote::STATUS_ACCEPTED]);
    }

    public function delete(User $user, Quote $quote): bool
    {
        return $user->isAdmin() && $quote->isDraft();
    }

    public function accept(User $user, Quote $quote): bool
    {
        return (int) $user->id === (int) $quote->serviceRequest?->client_id && $quote->canBeAccepted();
    }

    public function refuse(User $user, Quote $quote): bool
    {
        return (int) $user->id === (int) $quote->serviceRequest?->client_id && $quote->isSent();
    }
}
