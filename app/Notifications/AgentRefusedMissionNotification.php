<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentRefusedMissionNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Mission $mission,
        public ?string $reason = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('❌ Intervention refusée par intervenant - '.$this->mission->mission_number)
            ->view('emails.agent-refused-mission', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
                'reason' => $this->reason,
                'agentName' => $this->mission->agent->name ?? 'N/A',
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'agent_refused_mission',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'agent_name' => $this->mission->agent->name ?? 'N/A',
            'reason' => $this->reason,
            'message' => 'Intervention refusée par '.($this->mission->agent->name ?? 'intervenant'),
            'url' => '/admin/missions/'.$this->mission->id,
        ];
    }
}
