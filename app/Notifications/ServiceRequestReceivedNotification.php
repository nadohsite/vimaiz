<?php

namespace App\Notifications;

use App\Models\ServiceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ServiceRequestReceivedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public ServiceRequest $serviceRequest
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre demande a bien été reçue — '.$this->serviceRequest->request_number)
            ->view('emails.service-request-received', [
                'notifiable' => $notifiable,
                'serviceRequest' => $this->serviceRequest,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $date = optional($this->serviceRequest->scheduled_date)->format('d/m/Y');

        return [
            'type' => 'service_request_received',
            'service_request_id' => $this->serviceRequest->id,
            'request_number' => $this->serviceRequest->request_number,
            'message' => $date
                ? 'Votre demande '.$this->serviceRequest->request_number.' a bien été envoyée pour le '.$date.'. Vous recevrez un devis sous 24h.'
                : 'Votre demande '.$this->serviceRequest->request_number.' a bien été envoyée. Vous recevrez un devis sous 24h.',
            'url' => '/client/requests/'.$this->serviceRequest->id,
        ];
    }
}
