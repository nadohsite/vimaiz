<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClientValidatedInterventionNotification extends Notification implements ShouldQueue
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
            ->subject('Intervention validée — Vimaiz')
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('✅ Votre intervention a été validée.')
            ->line('Merci pour votre professionnalisme.')
            ->action('Voir l\'intervention', url('/agent/missions/' . $this->mission->id))
            ->salutation('L\'équipe Vimaiz');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'client_validated_intervention',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'message' => '✅ Votre intervention a été validée. Merci pour votre professionnalisme.',
            'url' => '/agent/missions/' . $this->mission->id,
        ];
    }
}
