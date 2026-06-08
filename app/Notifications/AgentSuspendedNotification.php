<?php

namespace App\Notifications;

use App\Notifications\Concerns\BroadcastsVimaizNotification;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentSuspendedNotification extends Notification implements ShouldQueue
{
    use BroadcastsVimaizNotification, Queueable;

    public function __construct(
        public string $reason,
        public Carbon $suspendedUntil
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Suspension de votre compte agent - VIMAIZ')
            ->view('emails.agent-suspended', [
                'notifiable' => $notifiable,
                'reason' => $this->reason,
                'suspendedUntil' => $this->suspendedUntil,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'agent_suspended',
            'message' => 'Votre compte est suspendu jusqu\'au ' . $this->suspendedUntil->format('d/m/Y'),
            'reason' => $this->reason,
            'suspended_until' => $this->suspendedUntil->toISOString(),
            'url' => '/agent/dashboard',
        ];
    }
}
