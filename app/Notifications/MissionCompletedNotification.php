<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MissionCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Mission $mission
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->mission->loadMissing(['property', 'anomalies']);

        return (new MailMessage)
            ->subject('Intervention terminée — à confirmer — '.$this->mission->mission_number)
            ->view('emails.mission-completed', [
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
            'completed_at' => $this->mission->completed_at?->toISOString(),
            'message' => '✨ L\'intervention est terminée. Il ne vous reste plus qu\'à confirmer que tout est conforme.',
            'url' => '/client/missions/'.$this->mission->id,
        ];
    }
}
