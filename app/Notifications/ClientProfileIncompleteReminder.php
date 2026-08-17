<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClientProfileIncompleteReminder extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Ajoutez votre logement pour démarrer')
            ->view('emails.reminder-client-profile', [
                'notifiable' => $notifiable,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'client_profile_incomplete',
            'message' => 'Ajoutez votre premier logement pour pouvoir programmer une intervention.',
            'url' => '/client/properties/create',
        ];
    }
}
