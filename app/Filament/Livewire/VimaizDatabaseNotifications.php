<?php

namespace App\Filament\Livewire;

use App\Support\VimaizNotificationFormatter;
use Filament\Enums\DatabaseNotificationsPosition;
use Filament\Livewire\DatabaseNotifications as BaseDatabaseNotifications;
use Filament\Notifications\Notification;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Notifications\DatabaseNotification;

class VimaizDatabaseNotifications extends BaseDatabaseNotifications
{
    public function getNotificationsQuery(): Builder | Relation
    {
        $user = $this->getUser();

        if (! $user) {
            abort(401);
        }

        /** @phpstan-ignore-next-line */
        return $user->notifications();
    }

    public function getNotification(DatabaseNotification $notification): Notification
    {
        return VimaizNotificationFormatter::toFilament($notification)
            ->date($this->formatNotificationDate($notification->getAttributeValue('created_at')));
    }

    public function getTrigger(): ?View
    {
        return (($this->position ?? filament()->getDatabaseNotificationsPosition()) === DatabaseNotificationsPosition::Topbar)
            ? view('filament-panels::components.topbar.database-notifications-trigger')
            : view('filament-panels::components.sidebar.database-notifications-trigger');
    }
}
