<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentWarningNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $reason,
        public int $warningsCount
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Avertissement - VIMAIZ')
            ->view('emails.agent-warning', [
                'notifiable' => $notifiable,
                'reason' => $this->reason,
                'warningsCount' => $this->warningsCount,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'agent_warning',
            'message' => 'Vous avez reçu un avertissement. Total : '.$this->warningsCount,
            'reason' => $this->reason,
            'warnings_count' => $this->warningsCount,
            'url' => '/agent/dashboard',
        ];
    }
}
