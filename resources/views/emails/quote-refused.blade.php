@extends('emails.layout')

@section('title', 'Devis refusé')

@section('content')
    <h1>❌ Devis refusé par le client</h1>
    
    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>
    
    <p>Un client a refusé le devis qui lui a été envoyé.</p>

    <div class="warning-box">
        <p><strong>Numéro devis :</strong> {{ $quote->quote_number }}</p>
        <p><strong>Client :</strong> {{ $quote->serviceRequest->client->name ?? 'N/A' }}</p>
        <p><strong>Email :</strong> {{ $quote->serviceRequest->client->email ?? 'N/A' }}</p>
        <p><strong>Montant proposé :</strong> {{ number_format($quote->final_price ?? $quote->estimated_price, 2, ',', ' ') }} €</p>
        <p><strong>Date de refus :</strong> {{ $quote->responded_at ? $quote->responded_at->format('d/m/Y à H:i') : now()->format('d/m/Y à H:i') }}</p>
    </div>

    <p style="text-align: center;">
        <a href="{{ config('app.url') }}/admin/quotes/{{ $quote->id }}" class="button">
            Voir le devis
        </a>
    </p>

    <p style="font-size: 13px; color: #64748b; margin-top: 30px;">
        Vous pouvez contacter le client pour comprendre les raisons du refus et proposer une alternative.
    </p>
@endsection
