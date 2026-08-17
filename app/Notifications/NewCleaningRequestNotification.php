<?php

namespace App\Notifications;

use App\Models\CleaningRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewCleaningRequestNotification extends Notification
{
    use Queueable;

    public function __construct(
        public CleaningRequest $request
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
        return (new MailMessage)
            ->subject('Nouvelle demande d\'intervention — '.$this->request->request_number)
            ->view('emails.new-cleaning-request', [
                'notifiable' => $notifiable,
                'request' => $this->request,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_cleaning_request',
            'request_id' => $this->request->id,
            'request_number' => $this->request->request_number,
            'client_name' => $this->request->user->name,
            'message' => 'Nouvelle intervention : '.$this->request->request_number,
            'url' => '/admin/cleaning-requests/'.$this->request->id,
        ];
    }
}
