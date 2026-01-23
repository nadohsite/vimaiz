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
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $price = $this->quote->final_price ?? $this->quote->estimated_price;
        $serviceRequest = $this->quote->serviceRequest;
        $property = $serviceRequest->property;

        return (new MailMessage)
            ->subject('Votre devis VIMAIZ est prêt')
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('Nous avons préparé votre devis pour le ménage de votre logement.')
            ->line('')
            ->line('**Détails du devis :**')
            ->line('- Logement : ' . ($property->name ?? $property->type_label))
            ->line('- Date prévue : ' . $serviceRequest->scheduled_date->format('d/m/Y') . ' à ' . $serviceRequest->scheduled_time)
            ->line('- Durée : ' . $serviceRequest->requested_hours . ' heure(s)')
            ->line('')
            ->line('**Montant total : ' . number_format($price, 2, ',', ' ') . ' €**')
            ->action('Voir le devis', url('/client/quotes/' . $this->quote->id))
            ->line('Ce devis est valable jusqu\'au ' . $this->quote->expires_at?->format('d/m/Y') . '.')
            ->salutation('L\'équipe VIMAIZ');
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
