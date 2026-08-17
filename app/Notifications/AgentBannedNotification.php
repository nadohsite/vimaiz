<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentBannedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $reason
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Exclusion définitive de votre compte - VIMAIZ')
            ->view('emails.agent-banned', [
                'notifiable' => $notifiable,
                'reason' => $this->reason,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'agent_banned',
            'message' => 'Votre compte a été définitivement exclu de la plateforme.',
            'reason' => $this->reason,
            'url' => '/agent/dashboard',
        ];
    }
}
