<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MissionAssignedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Mission $mission
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Une intervention vous est proposée — '.$this->mission->mission_number)
            ->view('emails.mission-assigned', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        // Brigades : agent_payout est le pool TOTAL de la mission, pas ce
        // que CET agent touchera. On affiche une estimation par intervenant
        // (le montant définitif n'est fixé qu'à la clôture, sur l'effectif
        // réellement présent — décision du 15/10/2026), pour ne pas laisser
        // croire que l'agent proposé toucherait tout le pool à lui seul.
        $requiredAgents = max(1, (int) $this->mission->required_agents);
        $estimatedPayout = round((float) $this->mission->agent_payout / $requiredAgents, 2);

        return [
            'type' => 'mission_assigned',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'scheduled_at' => $this->mission->scheduled_at?->toISOString(),
            'payout' => $estimatedPayout,
            'required_agents' => $requiredAgents,
            'message' => $requiredAgents > 1
                ? "Une intervention en brigade ({$requiredAgents} intervenants) vous est proposée. Acceptez-la pour réserver votre créneau."
                : 'Une intervention vous est proposée. Acceptez-la pour la réserver.',
            'url' => '/agent/missions/'.$this->mission->id,
        ];
    }
}
