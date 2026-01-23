<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentPayoutNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Mission $mission,
        public float $amount
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Paiement crédité - ' . number_format($this->amount, 2, ',', ' ') . ' €')
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('Votre paiement pour la mission ' . $this->mission->mission_number . ' a été crédité sur votre portefeuille.')
            ->line('')
            ->line('**Montant crédité : ' . number_format($this->amount, 2, ',', ' ') . ' €**')
            ->line('')
            ->line('Vous pouvez demander un virement vers votre compte bancaire à tout moment depuis votre espace agent.')
            ->action('Voir mon portefeuille', url('/agent/wallet'))
            ->salutation('L\'équipe VIMAIZ');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'agent_payout',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'amount' => $this->amount,
            'message' => number_format($this->amount, 2, ',', ' ') . ' € crédités sur votre portefeuille',
            'url' => '/agent/wallet',
        ];
    }
}
