<?php

namespace App\Notifications;

use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class QuoteAcceptedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Quote $quote
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('✅ Devis accepté - ' . $this->quote->quote_number)
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line('Le devis ' . $this->quote->quote_number . ' a été accepté par le client.')
            ->line('**Client:** ' . $this->quote->user->name)
            ->line('**Montant:** ' . number_format($this->quote->final_price ?? $this->quote->estimated_price, 2, ',', ' ') . ' €')
            ->action('Voir le devis', url('/admin/quotes/' . $this->quote->id))
            ->line('Le client peut maintenant procéder au paiement.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'quote_accepted',
            'quote_id' => $this->quote->id,
            'quote_number' => $this->quote->quote_number,
            'client_name' => $this->quote->user->name,
            'amount' => $this->quote->final_price ?? $this->quote->estimated_price,
            'message' => 'Devis accepté : ' . $this->quote->quote_number,
            'url' => '/admin/quotes/' . $this->quote->id,
        ];
    }
}
