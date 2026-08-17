<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MissionNeedsAgentNotification extends Notification
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
            ->subject('Intervention sans intervenant — '.$this->mission->mission_number)
            ->view('emails.mission-needs-agent', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'mission_needs_agent',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'message' => 'Aucun intervenant éligible n\'a pu être assigné. Attribution manuelle requise.',
            'url' => '/admin/missions/'.$this->mission->id,
        ];
    }
}
