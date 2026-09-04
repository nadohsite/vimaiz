<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\Mission;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class InvoicePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Invoice $invoice): bool
    {
        if ($user->id === $invoice->user_id || $user->isAdmin()) {
            return true;
        }

        $mission = $invoice->relationLoaded('mission')
            ? $invoice->mission
            : $invoice->mission()->first();

        return $mission
            && $mission->agent_id === $user->id
            && $mission->status === Mission::STATUS_COMPLETED;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->isAdmin();
    }
}
