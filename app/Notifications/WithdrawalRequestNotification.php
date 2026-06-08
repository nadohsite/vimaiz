<?php

namespace App\Notifications;

use App\Notifications\Concerns\BroadcastsVimaizNotification;
use App\Models\WalletTransaction;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WithdrawalRequestNotification extends Notification implements ShouldQueue
{
    use BroadcastsVimaizNotification, Queueable;

    public function __construct(
        public WalletTransaction $transaction,
        public User $agent
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $bankAccount = $this->transaction->metadata['bank_account'] ?? 'Non renseigné';
        
        return (new MailMessage)
            ->subject('Nouvelle demande de retrait - ' . number_format($this->transaction->amount, 2, ',', ' ') . ' €')
            ->view('emails.withdrawal-request', [
                'notifiable' => $notifiable,
                'transaction' => $this->transaction,
                'agent' => $this->agent,
                'bankAccount' => $bankAccount,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'withdrawal_request',
            'transaction_id' => $this->transaction->id,
            'agent_id' => $this->agent->id,
            'agent_name' => $this->agent->name,
            'amount' => $this->transaction->amount,
            'message' => $this->agent->name . ' demande un retrait de ' . number_format($this->transaction->amount, 2, ',', ' ') . ' €',
            'url' => '/admin/withdrawal-requests/' . $this->transaction->id,
        ];
    }
}
