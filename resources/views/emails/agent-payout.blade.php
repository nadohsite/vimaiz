@extends('emails.layout')

@section('title', 'Paiement crédité')

@section('content')
    <h1>Paiement crédité ! 💰</h1>
    
    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>
    
    <p>Votre paiement pour l'intervention terminée a été crédité sur votre portefeuille VIMAIZ.</p>
    
    <div class="success-box">
        <p style="font-size: 24px;"><strong>+ {{ number_format($amount, 2, ',', ' ') }} €</strong></p>
    </div>
    
    <div class="info-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Date de crédit :</strong> {{ now()->format('d/m/Y à H:i') }}</p>
    </div>
    
    <p>Vous pouvez demander un virement vers votre compte bancaire à tout moment depuis votre espace intervenant.</p>
    
    <p style="text-align: center;">
        <a href="{{ url('/agent/wallet') }}" class="button">
            Voir mon portefeuille
        </a>
    </p>
    
    <p>Merci pour votre excellent travail !<br>L'équipe VIMAIZ</p>
@endsection
