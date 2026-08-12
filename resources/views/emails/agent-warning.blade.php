@extends('emails.layout')

@section('title', 'Avertissement')

@section('content')
    <h1>Avertissement reçu ! ⚠️</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Nous vous informons que vous avez reçu un avertissement concernant votre activité sur VIMAIZ.</p>

    <div class="success-box">
        <p><strong>Type :</strong> Avertissement</p>
        <p><strong>Nombre total d'avertissements :</strong> {{ $warningsCount }}</p>
        <p><strong>Date :</strong> {{ now()->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="warning-box">
        <p><strong>Raison de l'avertissement :</strong></p>
        <p>{{ $reason }}</p>
        <p>Au-delà de 3 avertissements, votre compte pourra faire l'objet d'une suspension.</p>
    </div>

    <div class="info-box">
        <p><strong>Que faire maintenant ?</strong></p>
        <p>Prenez note de cet avertissement, assurez-vous de respecter les conditions d'utilisation, et contactez-nous si vous pensez qu'il y a eu une erreur.</p>
        <p>Pour toute question ou contestation : <a href="mailto:contact@vimaiz.com">contact@vimaiz.com</a>.</p>
    </div>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
