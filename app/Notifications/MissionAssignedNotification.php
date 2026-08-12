<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MissionAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Mission $mission
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouvelle intervention à accepter — ' . $this->mission->mission_number)
            ->view('emails.mission-assigned', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'mission_assigned',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'scheduled_at' => $this->mission->scheduled_at->toISOString(),
            'payout' => $this->mission->agent_payout,
            'message' => '🔔 Une nouvelle intervention est disponible près de chez vous.',
            'url' => '/agent/missions/' . $this->mission->id,
        ];
    }
}
