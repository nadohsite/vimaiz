<?php

namespace App\Notifications;

use App\Notifications\Concerns\BroadcastsVimaizNotification;
use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReturnRequestedNotification extends Notification implements ShouldQueue
{
    use BroadcastsVimaizNotification, Queueable;

    public function __construct(
        public Mission $mission
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('⚠️ Demande de retour - Mission ' . $this->mission->mission_number)
            ->view('emails.return-requested', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'return_requested',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'client_name' => $this->mission->client->name ?? 'N/A',
            'reason' => $this->mission->return_reason,
            'message' => 'Demande de retour : ' . $this->mission->mission_number,
            'url' => '/admin/missions/' . $this->mission->id,
        ];
    }
}
