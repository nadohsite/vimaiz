<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MissionCompletedAdminNotification extends Notification
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
        $this->mission->loadMissing(['property', 'anomalies', 'agent', 'client']);

        return (new MailMessage)
            ->subject('🎉 Intervention terminée - '.$this->mission->mission_number)
            ->view('emails.mission-completed-admin', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'mission_completed',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'agent_name' => $this->mission->agent->name ?? 'N/A',
            'total_price' => $this->mission->total_price,
            'message' => 'Intervention terminée : '.$this->mission->mission_number,
            'url' => '/admin/missions/'.$this->mission->id,
        ];
    }
}
