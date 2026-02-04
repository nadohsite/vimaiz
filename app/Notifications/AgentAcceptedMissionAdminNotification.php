<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentAcceptedMissionAdminNotification extends Notification implements ShouldQueue
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
            ->subject('✅ Mission acceptée par agent - ' . $this->mission->mission_number)
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
            'message' => 'Mission acceptée par ' . ($this->mission->agent->name ?? 'agent'),
            'url' => '/admin/missions/' . $this->mission->id,
        ];
    }
}
