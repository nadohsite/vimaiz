<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentAcceptedMissionNotification extends Notification
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
            ->subject((\App\Support\Brigade::confirmedSize($this->mission) > 1
                ? 'Votre équipe est constituée — '
                : 'Votre intervenant est confirmé — ').$this->mission->mission_number)
            ->view('emails.agent-accepted-mission', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'agent_accepted',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'scheduled_at' => $this->mission->scheduled_at->toISOString(),
            'message' => \App\Support\Brigade::confirmedSize($this->mission) > 1
                ? '✅ Votre équipe de '.\App\Support\Brigade::confirmedSize($this->mission).' intervenants certifiés est constituée pour votre intervention.'
                : '✅ Un intervenant certifié est confirmé pour votre intervention.',
            'url' => '/client/missions/'.$this->mission->id,
        ];
    }
}
