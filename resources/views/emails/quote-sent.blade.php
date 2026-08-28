@extends('emails.layout')

@section('title', 'Votre devis est prêt')

@section('content')
    <h1>Votre devis est prêt ! 📋</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Nous avons préparé votre devis pour l'intervention sur votre bien.</p>

    <div class="success-box">
        <p><strong>Devis :</strong> {{ $quote->quote_number }}</p>
        <p><strong>Montant total :</strong> {{ number_format($quote->final_price ?? $quote->estimated_price, 2, ',', ' ') }} € TTC</p>
        @if($quote->expires_at)
            <p><strong>Valable jusqu'au :</strong> {{ $quote->expires_at->format('d/m/Y') }}</p>
        @endif
    </div>

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $quote->serviceRequest?->property?->name ?? $quote->serviceRequest?->property?->type ?? '—' }}</p>
        <p><strong>Surface :</strong> {{ $quote->serviceRequest?->property?->surface_area ?? '—' }} m²</p>
        <p><strong>Date prévue :</strong>
            {{ optional($quote->serviceRequest?->scheduled_date)->format('d/m/Y') ?? '—' }}
            @if($quote->serviceRequest?->scheduled_time)
                à {{ $quote->serviceRequest->scheduled_time }}
            @endif
        </p>
        @if($quote->estimated_hours)
            <p><strong>Durée estimée :</strong> {{ $quote->estimated_hours }} heure(s)</p>
        @endif
    </div>

    @if($quote->price_adjustment_reason)
        <div class="info-box">
            <p><strong>Détails de la prestation :</strong></p>
            <p style="white-space: pre-line;">{{ $quote->price_adjustment_reason }}</p>
        </div>
    @endif

    <p>Une fois le devis accepté, vous pourrez procéder au paiement sécurisé et un intervenant vous sera attribué.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/client/quotes/' . $quote->id) }}" class="button">
            Voir le devis
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
