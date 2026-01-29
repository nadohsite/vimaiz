<?php

namespace App\Notifications;

use App\Models\CleaningRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewCleaningRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public CleaningRequest $request
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
            ->subject('🏠 Nouvelle demande de ménage - ' . $this->request->request_number)
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line('Une nouvelle demande de ménage a été soumise.')
            ->line('**Numéro de demande:** ' . $this->request->request_number)
            ->line('**Client:** ' . $this->request->user->name)
            ->line('**Type de logement:** ' . ($this->request->property->property_type ?? 'N/A'))
            ->line('**Date souhaitée:** ' . ($this->request->preferred_date ? $this->request->preferred_date->format('d/m/Y') : 'Flexible'))
            ->action('Voir la demande', url('/admin/cleaning-requests/' . $this->request->id))
            ->line('Merci de traiter cette demande rapidement.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_cleaning_request',
            'request_id' => $this->request->id,
            'request_number' => $this->request->request_number,
            'client_name' => $this->request->user->name,
            'message' => 'Nouvelle demande de ménage : ' . $this->request->request_number,
            'url' => '/admin/cleaning-requests/' . $this->request->id,
        ];
    }
}
