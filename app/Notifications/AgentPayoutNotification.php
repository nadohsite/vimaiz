<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentPayoutNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Mission $mission,
        public float $amount
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Paiement crédité - '.number_format($this->amount, 2, ',', ' ').' €')
            ->view('emails.agent-payout', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
                'amount' => $this->amount,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'agent_payout',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'amount' => $this->amount,
            'message' => number_format($this->amount, 2, ',', ' ').' € crédités sur votre portefeuille',
            'url' => '/agent/wallet',
        ];
    }
}
