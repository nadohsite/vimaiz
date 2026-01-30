<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public ContactMessage $contactMessage;
    public string $replySubject;
    public string $replyMessage;

    public function __construct(ContactMessage $contactMessage, string $subject, string $message)
    {
        $this->contactMessage = $contactMessage;
        $this->replySubject = $subject;
        $this->replyMessage = $message;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->replySubject,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.contact-reply',
            with: [
                'contactMessage' => $this->contactMessage,
                'replyMessage' => $this->replyMessage,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
