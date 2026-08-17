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
        return ['mail', 'database'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Devis accepté — '.$this->quote->quote_number)
            ->view('emails.quote-accepted', [
                'notifiable' => $notifiable,
                'quote' => $this->quote,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'quote_accepted',
            'quote_id' => $this->quote->id,
            'quote_number' => $this->quote->quote_number,
            'client_name' => $this->quote->serviceRequest?->client?->name,
            'amount' => $this->quote->final_price ?? $this->quote->estimated_price,
            'message' => 'Devis accepté : '.$this->quote->quote_number,
            'url' => '/admin/quotes/'.$this->quote->id,
        ];
    }
}
