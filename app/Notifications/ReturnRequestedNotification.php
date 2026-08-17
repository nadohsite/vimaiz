<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReturnRequestedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Mission $mission
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('⚠️ Demande de retour - Intervention '.$this->mission->mission_number)
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
            'message' => 'Demande de retour : '.$this->mission->mission_number,
            'url' => '/admin/missions/'.$this->mission->id,
        ];
    }
}
