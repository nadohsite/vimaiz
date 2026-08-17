<?php

namespace App\Support;

use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;

class NotificationPayload
{
    /**
     * @return array{id: string, type: string, data: array<string, mixed>, read_at: mixed, created_at: mixed}
     */
    public static function from(DatabaseNotification $notification): array
    {
        return [
            'id' => (string) $notification->id,
            'type' => $notification->type,
            'data' => is_array($notification->data) ? $notification->data : [],
            'read_at' => $notification->read_at,
            'created_at' => $notification->created_at,
        ];
    }

    /**
     * @param  Collection<int, DatabaseNotification>  $notifications
     * @return list<array{id: string, type: string, data: array<string, mixed>, read_at: mixed, created_at: mixed}>
     */
    public static function collection(Collection $notifications): array
    {
        return $notifications
            ->map(fn (DatabaseNotification $notification) => self::from($notification))
            ->values()
            ->all();
    }
}
