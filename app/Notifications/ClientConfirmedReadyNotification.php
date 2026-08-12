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
            ->subject('Bien prêt — ' . $this->mission->mission_number)
            ->view('emails.client-confirmed-ready', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'client_confirmed_ready',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'message' => '✅ Merci. Votre bien est désormais prêt à accueillir ses prochains voyageurs.',
            'url' => '/client/missions/' . $this->mission->id,
        ];
    }
}
