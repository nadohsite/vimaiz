@extends('emails.layout')

@section('title', 'Nouveau devis disponible')

@section('content')
    <h1>Votre devis est prêt ! 📋</h1>
    
    <p>Bonjour {{ $notifiable->name }},</p>
    
    <p>Nous avons préparé votre devis pour la prestation de ménage de votre logement.</p>
    
    <div class="info-box">
        <p><strong>Référence :</strong> {{ $quote->quote_number }}</p>
        <p><strong>Logement :</strong> {{ $quote->serviceRequest->property->name ?? $quote->serviceRequest->property->type }}</p>
        <p><strong>Date prévue :</strong> {{ $quote->serviceRequest->scheduled_date->format('d/m/Y') }} à {{ $quote->serviceRequest->scheduled_time }}</p>
        <p><strong>Durée :</strong> {{ $quote->serviceRequest->requested_hours }} heure(s)</p>
    </div>
    
    <div class="success-box">
        <p style="font-size: 20px;"><strong>Montant total : {{ number_format($quote->final_price ?? $quote->estimated_price, 2, ',', ' ') }} € TTC</strong></p>
    </div>
    
    <p style="text-align: center;">
        <a href="{{ url('/client/quotes/' . $quote->id) }}" class="button">
            Voir le devis
        </a>
    </p>
    
    <div class="warning-box">
        <p>⏰ Ce devis est valable jusqu'au <strong>{{ $quote->expires_at?->format('d/m/Y') }}</strong></p>
    </div>
    
    <p>Une fois le devis accepté, vous pourrez procéder au paiement sécurisé et un agent professionnel vous sera attribué.</p>
    
    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
