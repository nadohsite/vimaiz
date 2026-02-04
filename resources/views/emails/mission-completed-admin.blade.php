@extends('emails.layout')

@section('title', 'Mission terminée')

@section('content')
    <h1>🎉 Mission terminée</h1>
    
    <p>Bonjour {{ $notifiable->name }},</p>
    
    <p>Une mission a été terminée avec succès par l'agent.</p>

    <div class="success-box">
        <p><strong>Mission :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Agent :</strong> {{ $mission->agent->name ?? 'N/A' }}</p>
        <p><strong>Client :</strong> {{ $mission->client->name ?? 'N/A' }}</p>
        <p><strong>Date de fin :</strong> {{ $mission->completed_at ? $mission->completed_at->format('d/m/Y à H:i') : now()->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="info-box">
        <p><strong>Récapitulatif financier :</strong></p>
        <p><strong>Montant total :</strong> {{ number_format($mission->total_price, 2, ',', ' ') }} €</p>
        <p><strong>Commission VIMAIZ :</strong> {{ number_format($mission->platform_fee, 2, ',', ' ') }} €</p>
        <p><strong>Paiement agent :</strong> {{ number_format($mission->agent_payout, 2, ',', ' ') }} €</p>
    </div>

    <p style="text-align: center;">
        <a href="{{ config('app.url') }}/admin/missions/{{ $mission->id }}" class="button">
            Voir la mission
        </a>
    </p>

    <p style="font-size: 13px; color: #64748b; margin-top: 30px;">
        Le paiement agent a été crédité sur son portefeuille. Le client peut maintenant laisser un avis.
    </p>
@endsection
