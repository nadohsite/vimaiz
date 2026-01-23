@extends('emails.layout')

@section('title', 'Paiement confirmé')

@section('content')
    <h1>Paiement reçu avec succès ! ✅</h1>
    
    <p>Bonjour {{ $notifiable->name }},</p>
    
    <p>Nous confirmons la réception de votre paiement. Votre réservation est maintenant confirmée !</p>
    
    <div class="success-box">
        <p><strong>Mission :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Montant payé :</strong> {{ number_format($mission->total_price, 2, ',', ' ') }} €</p>
        <p><strong>Date de paiement :</strong> {{ now()->format('d/m/Y à H:i') }}</p>
    </div>
    
    <div class="info-box">
        <p><strong>Logement :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Adresse :</strong> {{ $mission->property->address_line1 }}, {{ $mission->property->postal_code }} {{ $mission->property->city }}</p>
        <p><strong>Date de la prestation :</strong> {{ $mission->scheduled_at->format('d/m/Y à H:i') }}</p>
        <p><strong>Durée prévue :</strong> {{ $mission->duration_hours }} heure(s)</p>
    </div>
    
    <p>Un agent professionnel vous sera attribué dans les plus brefs délais. Vous recevrez une notification dès qu'il aura confirmé la mission.</p>
    
    <p style="text-align: center;">
        <a href="{{ url('/client/missions/' . $mission->id) }}" class="button">
            Suivre ma mission
        </a>
    </p>
    
    <p>Votre facture est disponible dans votre espace client.</p>
    
    <p>Merci de votre confiance !<br>L'équipe VIMAIZ</p>
@endsection
