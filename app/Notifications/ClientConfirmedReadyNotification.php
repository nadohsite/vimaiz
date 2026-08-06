<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to the client after they confirm/review a completed intervention. */
class ClientConfirmedReadyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Mission $mission
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Logement prêt — Vimaiz')
            ->greeting('Merci ' . $notifiable->name . ' !')
            ->line('✅ Merci.')
            ->line('Votre logement est désormais prêt à accueillir ses prochains voyageurs.')
            ->action('Voir l\'intervention', url('/client/missions/' . $this->mission->id))
            ->salutation('L\'équipe Vimaiz');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'client_confirmed_ready',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'message' => '✅ Merci. Votre logement est désormais prêt à accueillir ses prochains voyageurs.',
            'url' => '/client/missions/' . $this->mission->id,
        ];
    }
}
