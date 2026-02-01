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
            ->subject('Agent confirmé pour votre ménage')
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('Un agent professionnel a accepté votre mission de ménage.')
            ->line('')
            ->line('**Détails :**')
            ->line('- Mission : ' . $this->mission->mission_number)
            ->line('- Logement : ' . ($property->name ?? $property->type_label))
            ->line('- Date prévue : ' . $this->mission->scheduled_at->format('d/m/Y à H:i'))
            ->line('')
            ->line('Votre agent se présentera à l\'adresse indiquée à l\'heure convenue.')
            ->action('Voir les détails', url('/client/missions/' . $this->mission->id))
            ->salutation('L\'équipe VIMAIZ');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'agent_accepted',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'scheduled_at' => $this->mission->scheduled_at->toISOString(),
            'message' => 'Agent confirmé pour ' . $this->mission->mission_number,
            'url' => '/client/missions/' . $this->mission->id,
        ];
    }
}
