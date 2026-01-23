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
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $property = $this->mission->property;
        $scheduledAt = $this->mission->scheduled_at;

        return (new MailMessage)
            ->subject('Nouvelle mission VIMAIZ assignée')
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('Une nouvelle mission vous a été attribuée.')
            ->line('')
            ->line('**Détails de la mission :**')
            ->line('- Référence : ' . $this->mission->mission_number)
            ->line('- Logement : ' . ($property->name ?? $property->type_label))
            ->line('- Adresse : ' . $property->address_line1 . ', ' . $property->postal_code . ' ' . $property->city)
            ->line('- Surface : ' . $property->surface_area . ' m²')
            ->line('- Date : ' . $scheduledAt->format('d/m/Y') . ' à ' . $scheduledAt->format('H:i'))
            ->line('- Durée : ' . $this->mission->duration_hours . ' heure(s)')
            ->line('')
            ->line('**Rémunération : ' . number_format($this->mission->agent_payout, 2, ',', ' ') . ' €**')
            ->line('')
            ->line('⚠️ Vous avez **30 minutes** pour accepter ou refuser cette mission.')
            ->action('Voir la mission', url('/agent/missions/' . $this->mission->id))
            ->salutation('L\'équipe VIMAIZ');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'mission_assigned',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'scheduled_at' => $this->mission->scheduled_at->toISOString(),
            'payout' => $this->mission->agent_payout,
            'message' => 'Nouvelle mission : ' . $this->mission->mission_number,
            'url' => '/agent/missions/' . $this->mission->id,
        ];
    }
}
