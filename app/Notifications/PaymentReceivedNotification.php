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
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $property = $this->mission->property;

        return (new MailMessage)
            ->subject('Paiement reçu - Confirmation de réservation')
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('Votre paiement a été reçu avec succès !')
            ->line('')
            ->line('**Récapitulatif :**')
            ->line('- Mission : ' . $this->mission->mission_number)
            ->line('- Logement : ' . ($property->name ?? $property->type_label))
            ->line('- Date : ' . $this->mission->scheduled_at->format('d/m/Y') . ' à ' . $this->mission->scheduled_at->format('H:i'))
            ->line('- Montant payé : ' . number_format($this->mission->total_price, 2, ',', ' ') . ' €')
            ->line('')
            ->line('Un agent professionnel vous sera attribué dans les plus brefs délais. Vous recevrez une notification dès que l\'agent aura confirmé la mission.')
            ->action('Suivre ma mission', url('/client/missions/' . $this->mission->id))
            ->line('Merci de votre confiance !')
            ->salutation('L\'équipe VIMAIZ');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'payment_received',
            'mission_id' => $this->mission->id,
            'mission_number' => $this->mission->mission_number,
            'amount' => $this->mission->total_price,
            'message' => 'Paiement confirmé pour ' . $this->mission->mission_number,
            'url' => '/client/missions/' . $this->mission->id,
        ];
    }
}
