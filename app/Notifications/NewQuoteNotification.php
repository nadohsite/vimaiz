<?php

namespace App\Notifications;

use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewQuoteNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Quote $quote
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
        $this->quote->loadMissing(['serviceRequest.property']);

        return (new MailMessage)
            ->subject('Votre devis est prêt — '.$this->quote->quote_number)
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
            'service_request_id' => $this->quote->service_request_id,
            'amount' => $this->quote->final_price ?? $this->quote->estimated_price,
            'message' => 'Nouveau devis disponible : '.$this->quote->quote_number,
            'url' => route('client.quotes.show', $this->quote, false),
        ];
    }
}
