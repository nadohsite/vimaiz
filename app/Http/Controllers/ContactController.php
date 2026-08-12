<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        try {
            // Sauvegarder le message en base de données
            ContactMessage::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'subject' => $validated['subject'],
                'message' => $validated['message'],
                'status' => 'unread',
            ]);

            // Renommer 'message' en 'content' pour éviter le conflit avec $message de Mail
            $emailData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'subject' => $validated['subject'],
                'content' => $validated['message'],
                'notifiable' => new class
                {
                    public string $name = 'Vimaiz';

                    public string $email;

                    public function __construct()
                    {
                        $this->email = config('mail.contact_email', 'contact@vimaiz.com');
                    }

                    public function preferredFirstName(): string
                    {
                        return $this->name;
                    }
                },

            ];

            // Tenter d'envoyer un email (optionnel - ne bloque pas si ça échoue)
            try {
                Mail::send('emails.contact', $emailData, function ($message) use ($validated) {
                    $message->to(config('mail.contact_email', 'contact@vimaiz.com'))
                        ->subject('Nouveau message de contact : ' . $validated['subject'])
                        ->replyTo($validated['email'], $validated['name']);
                });
            } catch (\Exception $mailError) {
                // Log l'erreur mail mais ne pas bloquer - le message est déjà sauvegardé en DB
                Log::warning('Contact email failed to send: ' . $mailError->getMessage());
            }

            // Log pour le suivi
            Log::info('Contact form submitted', [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'subject' => $validated['subject'],
            ]);

            return back()->with('success', true);
        } catch (\Exception $e) {
            Log::error('Contact form error: ' . $e->getMessage());
            
            return back()->withErrors([
                'message' => 'Une erreur est survenue. Veuillez réessayer plus tard.',
            ]);
        }
    }
}
