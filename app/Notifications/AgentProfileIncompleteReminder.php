<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgentProfileIncompleteReminder extends Notification
{
    use Queueable;

    /**
     * @param  list<string>  $missingItems  Labels of missing profile items/documents
     */
    public function __construct(
        public array $missingItems = [],
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Complétez votre profil intervenant')
            ->view('emails.reminder-agent-profile', [
                'notifiable' => $notifiable,
                'missingItems' => $this->missingItems,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'agent_profile_incomplete',
            'message' => 'Votre profil est incomplet : complétez-le pour commencer à recevoir des interventions.',
            'url' => '/agent/documents',
        ];
    }
}
