<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentInterventionCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Mission $mission
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Intervention terminée — en attente du client — ' . $this->mission->mission_number)
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
            'message' => '🎉 Merci. Votre intervention est terminée. Le client va maintenant la confirmer.',
            'url' => '/agent/missions/' . $this->mission->id,
        ];
    }
}
