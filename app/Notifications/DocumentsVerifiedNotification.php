<?php

namespace App\Notifications;

use App\Notifications\Concerns\BroadcastsVimaizNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentsVerifiedNotification extends Notification implements ShouldQueue
{
    use BroadcastsVimaizNotification, Queueable;

    public function __construct() {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Vos documents ont été validés - VIMAIZ')
            ->view('emails.documents-verified', [
                'notifiable' => $notifiable,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'documents_verified',
            'message' => 'Vos documents ont été validés ! Vous pouvez maintenant recevoir des missions.',
            'url' => '/agent/documents',
        ];
    }
}
