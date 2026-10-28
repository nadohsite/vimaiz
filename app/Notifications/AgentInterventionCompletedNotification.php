<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentInterventionCompletedNotification extends Notification
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
            ->subject('Intervention clôturée — '.$this->mission->mission_number)
            ->view('emails.agent-intervention-completed', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'agent_intervention_completed',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'message' => '🎉 Merci. Intervention clôturée : votre part sera disponible après validation du propriétaire (48 h au plus tard).',
            'url' => '/agent/missions/'.$this->mission->id,
        ];
    }
}
