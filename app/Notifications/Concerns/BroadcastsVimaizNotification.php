<?php

namespace App\Notifications\Concerns;

trait BroadcastsVimaizNotification
{
    public function toBroadcast(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }
}
