<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MissionStartedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Mission $mission
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre ménage a commencé !')
            ->view('emails.mission-started', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'mission_started',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'started_at' => $this->mission->started_at->toISOString(),
            'message' => 'Mission ' . $this->mission->mission_number . ' démarrée',
            'url' => '/client/missions/' . $this->mission->id,
        ];
    }
}
