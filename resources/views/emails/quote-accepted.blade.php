@extends('emails.layout')

@section('title', 'Devis accepté')

@section('content')
    <h1>Devis accepté ✅</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Le devis {{ $quote->quote_number }} a été accepté par le client.</p>

    <div class="success-box">
        <p><strong>Devis :</strong> {{ $quote->quote_number }}</p>
        <p><strong>Montant :</strong> {{ number_format($quote->final_price ?? $quote->estimated_price, 2, ',', ' ') }} €</p>
    </div>

    <div class="info-box">
        <p><strong>Client :</strong> {{ $quote->serviceRequest?->client?->name ?? '—' }}</p>
    </div>

    <p>Le client peut maintenant procéder au paiement.</p>

    <p style="text-align: center;">
        <a href="{{ url('/admin/quotes/' . $quote->id) }}" class="button">
            Voir le devis
        </a>
    </p>

    <p>L'équipe VIMAIZ</p>
@endsection
