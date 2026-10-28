@extends('emails.layout')

@section('title', 'Votre devis est prêt')

@section('content')
    <h1>Votre devis est prêt</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Nous avons préparé le devis forfaitaire de l'intervention sur votre logement. Le montant indiqué est définitif : aucun frais caché.</p>

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
        @if($quote->serviceRequest?->property?->surface_area)
            <p><strong>Équipe prévue :</strong> {{ \App\Support\Brigade::label(\App\Support\Brigade::sizeForSurface($quote->serviceRequest->property->surface_area)) }}</p>
        @endif
        <p><strong>Date prévue :</strong>
            {{ optional($quote->serviceRequest?->scheduled_date)->format('d/m/Y') ?? '—' }}
            @if($quote->serviceRequest?->scheduled_time)
                à {{ $quote->serviceRequest->scheduled_time }}
            @endif
        </p>
    </div>

    @if($quote->price_adjustment_reason)
        <div class="info-box">
            <p><strong>Détails de la prestation :</strong></p>
            <p style="white-space: pre-line;">{{ $quote->price_adjustment_reason }}</p>
        </div>
    @endif

    <p>Une fois le devis accepté, vous réglez en ligne de façon sécurisée et Vimaiz constitue automatiquement votre équipe d'intervenants certifiés. Les intervenants ne sont payés qu'après votre validation de l'intervention.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/client/quotes/' . $quote->id) }}" class="button">
            Voir le devis
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
