<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Mission $mission
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
            ->subject('Votre intervention est confirmée — ' . $this->mission->mission_number)
            ->view('emails.payment-received', [
                'notifiable' => $notifiable,
                'mission' => $this->mission,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'payment_received',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'amount' => $this->mission->total_price,
            'message' => '🔔 Votre intervention a bien été enregistrée. Nous recherchons actuellement un intervenant disponible.',
            'url' => '/client/missions/' . $this->mission->id,
        ];
    }
}
