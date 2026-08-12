@extends('emails.layout')

@section('title', 'Réinitialisation du mot de passe')

@section('content')
    <h1>Réinitialisation de votre mot de passe 🔐</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Vous recevez cet email car une demande de réinitialisation de mot de passe a été effectuée pour votre compte Vimaiz.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ $url }}" class="button">
            Réinitialiser mon mot de passe
        </a>
    </p>

    <div class="warning-box">
        <p><strong>Ce lien expire dans {{ $expiresInMinutes }} minutes.</strong></p>
    </div>

    <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe reste inchangé.</p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
