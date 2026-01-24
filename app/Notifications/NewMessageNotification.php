<?php

namespace App\Notifications;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Message $message,
        public Conversation $conversation
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_message',
            'message' => 'Nouveau message de ' . $this->message->sender->name,
            'preview' => \Str::limit($this->message->message, 50),
            'conversation_id' => $this->conversation->id,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $this->message->sender->name,
            'url' => '/messages/' . $this->conversation->id,
        ];
    }
}
