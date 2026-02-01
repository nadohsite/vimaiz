<?php

namespace App\Notifications;

use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewQuoteNotification extends Notification implements ShouldQueue
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
            ->subject('Votre devis VIMAIZ est prêt')
            ->view('emails.quote-sent', [
                'notifiable' => $notifiable,
                'quote' => $this->quote,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_quote',
            'quote_id' => $this->quote->id,
            'quote_number' => $this->quote->quote_number,
            'amount' => $this->quote->final_price ?? $this->quote->estimated_price,
            'message' => 'Nouveau devis disponible : ' . $this->quote->quote_number,
            'url' => '/client/quotes/' . $this->quote->id,
        ];
    }
}
