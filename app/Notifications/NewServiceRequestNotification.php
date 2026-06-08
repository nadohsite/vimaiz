<?php

namespace App\Notifications;

use App\Models\ServiceRequest;
use App\Notifications\Concerns\BroadcastsVimaizNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewServiceRequestNotification extends Notification implements ShouldQueue
{
    use BroadcastsVimaizNotification, Queueable;

    public function __construct(
        public ServiceRequest $serviceRequest
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('🏠 Nouvelle demande de ménage - ' . $this->serviceRequest->request_number)
            ->view('emails.new-service-request', [
                'notifiable' => $notifiable,
                'serviceRequest' => $this->serviceRequest,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_service_request',
            'service_request_id' => $this->serviceRequest->id,
            'request_number' => $this->serviceRequest->request_number,
            'client_name' => $this->serviceRequest->client->name ?? 'N/A',
            'message' => 'Nouvelle demande : ' . $this->serviceRequest->request_number,
            'url' => '/admin/service-requests/' . $this->serviceRequest->id,
        ];
    }
}
