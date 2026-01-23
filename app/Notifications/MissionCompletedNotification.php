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

    public function toMail(object $notifiable): MailMessage
    {
        $property = $this->mission->property;
        $duration = $this->mission->started_at && $this->mission->completed_at 
            ? $this->mission->started_at->diffInMinutes($this->mission->completed_at) 
            : $this->mission->duration_hours * 60;

        return (new MailMessage)
            ->subject('Ménage terminé - Mission ' . $this->mission->mission_number)
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('Le ménage de votre logement est terminé ! 🎉')
            ->line('')
            ->line('**Récapitulatif :**')
            ->line('- Mission : ' . $this->mission->mission_number)
            ->line('- Logement : ' . ($property->name ?? $property->type_label))
            ->line('- Durée effective : ' . floor($duration / 60) . 'h' . ($duration % 60 > 0 ? sprintf('%02d', $duration % 60) : ''))
            ->line('')
            ->line('Les photos AVANT et APRÈS sont disponibles dans votre espace client.')
            ->action('Voir les photos', url('/client/missions/' . $this->mission->id))
            ->line('Merci de votre confiance. À bientôt sur VIMAIZ !')
            ->salutation('L\'équipe VIMAIZ');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'mission_completed',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'completed_at' => $this->mission->completed_at->toISOString(),
            'message' => 'Mission ' . $this->mission->mission_number . ' terminée',
            'url' => '/client/missions/' . $this->mission->id,
        ];
    }
}
