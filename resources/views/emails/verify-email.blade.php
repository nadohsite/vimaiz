@extends('emails.layout')

@section('title', 'Vérification de votre adresse email')

@section('content')
    <h1>Confirmez votre adresse email ! ✉️</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Bienvenue chez Vimaiz. Il ne reste qu'une étape : confirmer votre adresse email pour activer votre compte.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ $url }}" class="button">
            Vérifier mon adresse email
        </a>
    </p>

    <p>Si vous n'avez pas créé de compte Vimaiz, vous pouvez ignorer cet email.</p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
