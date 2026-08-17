<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentAcceptedMissionAdminNotification extends Notification
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
            ->subject('✅ Intervention confirmée par intervenant - '.$this->mission->mission_number)
            ->view('emails.agent-accepted-mission-admin', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'agent_accepted_mission',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'agent_name' => $this->mission->agent->name ?? 'N/A',
            'message' => 'Intervention confirmée par '.($this->mission->agent->name ?? 'intervenant'),
            'url' => '/admin/missions/'.$this->mission->id,
        ];
    }
}
