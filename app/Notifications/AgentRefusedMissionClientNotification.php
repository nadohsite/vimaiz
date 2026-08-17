<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentRefusedMissionClientNotification extends Notification
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
            ->subject('Nous recherchons un autre intervenant — '.$this->mission->mission_number)
            ->view('emails.agent-refused-mission-client', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'agent_refused_client',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'message' => 'L\'intervenant initial n\'est plus disponible. Nous recherchons un autre professionnel pour votre intervention.',
            'url' => '/client/missions/'.$this->mission->id,
        ];
    }
}
