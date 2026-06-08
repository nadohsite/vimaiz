<?php

namespace App\Listeners;

use Filament\Notifications\Events\DatabaseNotificationsSent;
use Illuminate\Notifications\Events\NotificationSent;

class BroadcastDatabaseNotificationRefresh
{
    public function handle(NotificationSent $event): void
    {
        if ($event->channel !== 'database') {
            return;
        }

        DatabaseNotificationsSent::dispatch($event->notifiable);
    }
}
