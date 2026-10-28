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
            ->subject('Préparez la prochaine arrivée de vos voyageurs')
            ->view('emails.reminder-client-booking', [
                'notifiable' => $notifiable,
                'availableAgentsCount' => $this->availableAgentsCount,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'client_booking_reminder',
            'message' => 'Planifiez dès maintenant la prochaine intervention dans votre logement.',
            'url' => '/client/requests/create',
        ];
    }
}
