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
        $property = $this->mission->property;

        return (new MailMessage)
            ->subject('Votre ménage a commencé !')
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('Bonne nouvelle ! L\'agent de ménage est arrivé et a commencé le nettoyage de votre logement.')
            ->line('')
            ->line('**Détails :**')
            ->line('- Mission : ' . $this->mission->mission_number)
            ->line('- Logement : ' . ($property->name ?? $property->type_label))
            ->line('- Début : ' . $this->mission->started_at->format('d/m/Y à H:i'))
            ->line('')
            ->line('L\'agent a pris des photos AVANT intervention qui seront disponibles dans votre espace.')
            ->action('Suivre la mission', url('/client/missions/' . $this->mission->id))
            ->salutation('L\'équipe VIMAIZ');
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
