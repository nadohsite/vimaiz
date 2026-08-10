@extends('emails.layout')

@section('title', 'Avertissement')

@section('content')
    <h1>Avertissement reçu ⚠️</h1>
    
    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>
    
    <p>Nous vous informons que vous avez reçu un avertissement concernant votre activité sur VIMAIZ.</p>
    
    <div class="warning-box">
        <p><strong>Raison de l'avertissement :</strong></p>
        <p style="margin-top: 10px;">{{ $reason }}</p>
    </div>
    
    <div class="info-box">
        <p><strong>Nombre total d'avertissements :</strong> {{ $warningsCount }}</p>
        <p style="margin-top: 10px; font-size: 13px;">
            ⚠️ Au-delà de 3 avertissements, votre compte pourra faire l'objet d'une suspension.
        </p>
    </div>
    
    <h2 style="margin-top: 30px;">Que faire maintenant ?</h2>
    
    <p>Nous vous encourageons à :</p>
    <ul style="margin: 20px 0; padding-left: 20px;">
        <li>Prendre note de cet avertissement</li>
        <li>Vous assurer de respecter les conditions d'utilisation</li>
        <li>Nous contacter si vous pensez qu'il y a eu une erreur</li>
    </ul>
    
    <p>Si vous avez des questions ou souhaitez contester cet avertissement, contactez-nous à <a href="mailto:contact@vimaiz.com">contact@vimaiz.com</a>.</p>
    
    <p>L'équipe VIMAIZ</p>
@endsection
