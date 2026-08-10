<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;

class WeeklyWorksRecapNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  Collection<int, object>  $completedMissions
     * @param  Collection<int, object>  $upcomingMissions
     */
    public function __construct(
        public Collection $completedMissions,
        public Collection $upcomingMissions,
        public string $weekLabel,
        public string $role,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre récap de la semaine — Vimaiz')
            ->view('emails.weekly-works-recap', [
                'notifiable' => $notifiable,
                'completedMissions' => $this->completedMissions,
                'upcomingMissions' => $this->upcomingMissions,
                'weekLabel' => $this->weekLabel,
                'role' => $this->role,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'weekly_works_recap',
            'message' => 'Votre récapitulatif des interventions de la semaine est disponible.',
            'completed_count' => $this->completedMissions->count(),
            'upcoming_count' => $this->upcomingMissions->count(),
            'url' => $this->role === 'agent' ? '/agent/dashboard' : '/dashboard',
        ];
    }
}
