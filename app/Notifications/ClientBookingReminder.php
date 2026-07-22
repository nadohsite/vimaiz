<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClientBookingReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $availableAgentsCount = 0,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Des agents sont disponibles pour votre prochain ménage - VIMAIZ')
            ->view('emails.reminder-client-booking', [
                'notifiable' => $notifiable,
                'availableAgentsCount' => $this->availableAgentsCount,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'client_booking_reminder',
            'message' => 'Des agents sont disponibles : planifiez votre prochain ménage dès maintenant.',
            'url' => '/client/requests/create',
        ];
    }
}
