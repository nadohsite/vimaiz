@extends('emails.layout')

@section('title', 'Devis refusé')

@section('content')
    <h1>Devis refusé par le client ! ❌</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Un client a refusé le devis qui lui a été envoyé.</p>

    <div class="success-box">
        <p><strong>Numéro devis :</strong> {{ $quote->quote_number }}</p>
        <p><strong>Client :</strong> {{ $quote->serviceRequest->client->name ?? 'N/A' }}</p>
        <p><strong>Montant proposé :</strong> {{ number_format($quote->final_price ?? $quote->estimated_price, 2, ',', ' ') }} €</p>
    </div>

    <div class="info-box">
        <p><strong>Email :</strong> {{ $quote->serviceRequest->client->email ?? 'N/A' }}</p>
        <p><strong>Date de refus :</strong> {{ ($quote->responded_at ?? now())->format('d/m/Y à H:i') }}</p>
        <p>Vous pouvez contacter le client pour comprendre les raisons du refus et proposer une alternative.</p>
    </div>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ config('app.url') }}/admin/quotes/{{ $quote->id }}" class="button">
            Voir le devis
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
