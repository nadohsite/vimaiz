<?php

namespace App\Notifications;

use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class QuoteRefusedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Quote $quote
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('❌ Devis refusé - ' . $this->quote->quote_number)
            ->view('emails.quote-refused', [
                'notifiable' => $notifiable,
                'quote' => $this->quote,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'quote_refused',
            'quote_id' => $this->quote->id,
            'quote_number' => $this->quote->quote_number,
            'service_request_id' => $this->quote->service_request_id,
            'message' => 'Devis ' . $this->quote->quote_number . ' refusé par le client',
            'url' => '/admin/quotes/' . $this->quote->id,
        ];
    }
}
