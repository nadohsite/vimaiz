<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClientProfileIncompleteReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Ajoutez votre logement et planifiez votre premier ménage - VIMAIZ')
            ->view('emails.reminder-client-profile', [
                'notifiable' => $notifiable,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'client_profile_incomplete',
            'message' => 'Ajoutez votre premier logement pour pouvoir demander un ménage.',
            'url' => '/client/properties/create',
        ];
    }
}
