<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClientBookingReminder extends Notification
{
    use Queueable;

    public function __construct(
        public int $availableAgentsCount = 0,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Des intervenants sont disponibles près de chez vous')
            ->view('emails.reminder-client-booking', [
                'notifiable' => $notifiable,
                'availableAgentsCount' => $this->availableAgentsCount,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'client_booking_reminder',
            'message' => 'Des intervenants sont disponibles : programmez votre prochaine intervention dès maintenant.',
            'url' => '/client/requests/create',
        ];
    }
}
