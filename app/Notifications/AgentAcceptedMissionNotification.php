<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentAcceptedMissionNotification extends Notification implements ShouldQueue
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

        return (new MailMessage)
            ->subject('Intervention confirmée — Vimaiz')
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('✅ Votre intervention est désormais prise en charge.')
            ->line('Un intervenant Vimaiz a été assigné à votre logement.')
            ->line('')
            ->line('**Détails :**')
            ->line('- Intervention : ' . $this->mission->mission_number)
            ->line('- Logement : ' . ($property->name ?? $property->type_label))
            ->line('- Date prévue : ' . $this->mission->scheduled_at->format('d/m/Y à H:i'))
            ->action('Voir les détails', url('/client/missions/' . $this->mission->id))
            ->salutation('L\'équipe Vimaiz');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'agent_accepted',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'scheduled_at' => $this->mission->scheduled_at->toISOString(),
            'message' => '✅ Votre intervention est désormais prise en charge. Un intervenant Vimaiz a été assigné à votre logement.',
            'url' => '/client/missions/' . $this->mission->id,
        ];
    }
}
