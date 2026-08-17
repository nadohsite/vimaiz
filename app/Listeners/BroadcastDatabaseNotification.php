<?php

namespace App\Listeners;

use App\Events\NotificationEvent;
use App\Models\User;
use App\Support\NotificationPayload;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\Events\NotificationSent;
use Throwable;

class BroadcastDatabaseNotification
{
    public function handle(NotificationSent $event): void
    {
        if ($event->channel !== 'database') {
            return;
        }

        if (! $event->notifiable instanceof User) {
            return;
        }

        $notification = $event->response;
        if (! $notification instanceof DatabaseNotification) {
            return;
        }

        $payload = NotificationPayload::from($notification);
        $data = $payload['data'];

        try {
            event(new NotificationEvent($event->notifiable->id, [
                'id' => $payload['id'],
                'type' => $data['type'] ?? $payload['type'],
                'message' => $data['message'] ?? $data['body'] ?? '',
                'url' => $data['url'] ?? null,
                'data' => $data,
            ]));
        } catch (Throwable $e) {
            report($e);
        }
    }
}
