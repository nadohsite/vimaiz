@extends('emails.layout')

@section('title', 'Nouveau devis disponible')

@section('content')
    <h1>Votre devis est prêt ! 📋</h1>
    
    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>
    
    <p>Nous avons préparé votre devis pour l'intervention sur votre bien.</p>
    
    <div class="info-box">
        <p><strong>Référence :</strong> {{ $quote->quote_number }}</p>
        <p><strong>Bien :</strong> {{ $quote->serviceRequest->property->name ?? $quote->serviceRequest->property->type }}</p>
        <p><strong>Surface :</strong> {{ $quote->serviceRequest->property->surface_area }} m²</p>
        <p><strong>Date prévue :</strong> {{ $quote->serviceRequest->scheduled_date->format('d/m/Y') }} à {{ $quote->serviceRequest->scheduled_time }}</p>
        @if($quote->estimated_hours)
        <p><strong>Durée estimée :</strong> {{ $quote->estimated_hours }} heure(s)</p>
        @endif
    </div>
    
    <div class="success-box">
        <p style="font-size: 20px;"><strong>Montant total : {{ number_format($quote->final_price ?? $quote->estimated_price, 2, ',', ' ') }} € TTC</strong></p>
    </div>
    
    @if($quote->price_adjustment_reason)
    <div class="info-box" style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9;">
        <p><strong>💬 Détails de la prestation :</strong></p>
        <p style="white-space: pre-line;">{{ $quote->price_adjustment_reason }}</p>
    </div>
    @endif
    
    <p style="text-align: center;">
        <a href="{{ url('/client/quotes/' . $quote->id) }}" class="button">
            Voir le devis
        </a>
    </p>
    
    <div class="warning-box">
        <p>⏰ Ce devis est valable jusqu'au <strong>{{ $quote->expires_at?->format('d/m/Y') }}</strong></p>
    </div>
    
    <p>Une fois le devis accepté, vous pourrez procéder au paiement sécurisé et un intervenant professionnel vous sera attribué.</p>
    
    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
