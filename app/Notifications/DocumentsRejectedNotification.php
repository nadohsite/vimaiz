<?php

namespace App\Notifications;

use App\Notifications\Concerns\BroadcastsVimaizNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentsRejectedNotification extends Notification implements ShouldQueue
{
    use BroadcastsVimaizNotification, Queueable;

    public function __construct(
        public string $reason
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Documents rejetés - Action requise - VIMAIZ')
            ->view('emails.documents-rejected', [
                'notifiable' => $notifiable,
                'reason' => $this->reason,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'documents_rejected',
            'message' => 'Vos documents ont été rejetés. Raison : ' . $this->reason,
            'reason' => $this->reason,
            'url' => '/agent/documents',
        ];
    }
}
