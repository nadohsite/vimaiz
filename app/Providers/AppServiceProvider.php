<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->brandAuthenticationMails();
    }

    /**
     * Les mails d'authentification de Laravel utilisent le markdown par défaut :
     * on les redirige vers le layout Vimaiz pour garder la même présentation.
     */
    protected function brandAuthenticationMails(): void
    {
        ResetPassword::toMailUsing(function (object $notifiable, string $token): MailMessage {
            $expire = config('auth.passwords.'.config('auth.defaults.passwords').'.expire', 60);

            return (new MailMessage)
                ->subject('Réinitialisation de votre mot de passe')
                ->view('emails.reset-password', [
                    'notifiable' => $notifiable,
                    'url' => url(route('password.reset', [
                        'token' => $token,
                        'email' => $notifiable->getEmailForPasswordReset(),
                    ], false)),
                    'expiresInMinutes' => $expire,
                ]);
        });

        VerifyEmail::toMailUsing(function (object $notifiable): MailMessage {
            $url = URL::temporarySignedRoute(
                'verification.verify',
                Carbon::now()->addMinutes((int) config('auth.verification.expire', 60)),
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ],
            );

            return (new MailMessage)
                ->subject('Confirmez votre adresse email')
                ->view('emails.verify-email', [
                    'notifiable' => $notifiable,
                    'url' => $url,
                ]);
        });
    }
}
