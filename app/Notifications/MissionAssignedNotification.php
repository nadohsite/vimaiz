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
            ->subject('Nouvelle intervention disponible — Vimaiz')
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('🔔 Une nouvelle intervention est disponible près de chez vous.')
            ->line('**Référence :** ' . $this->mission->mission_number)
            ->line('**Date prévue :** ' . $this->mission->scheduled_at->format('d/m/Y à H:i'))
            ->action('Voir l\'intervention', url('/agent/missions/' . $this->mission->id))
            ->salutation('L\'équipe Vimaiz');
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
