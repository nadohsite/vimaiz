@extends('emails.layout')

@section('title', 'Intervention acceptée')

@section('content')
    <h1>✅ Intervention acceptée par l'intervenant</h1>
    
    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>
    
    <p>Un intervenant a accepté une intervention qui lui a été proposée.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Intervenant :</strong> {{ $mission->agent->name ?? 'N/A' }}</p>
        <p><strong>Client :</strong> {{ $mission->client->name ?? 'N/A' }}</p>
        <p><strong>Date prévue :</strong> {{ $mission->scheduled_at ? $mission->scheduled_at->format('d/m/Y à H:i') : 'N/A' }}</p>
        <p><strong>Montant total :</strong> {{ number_format($mission->total_price, 2, ',', ' ') }} €</p>
    </div>

    <p style="text-align: center;">
        <a href="{{ config('app.url') }}/admin/missions/{{ $mission->id }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p style="font-size: 13px; color: #64748b; margin-top: 30px;">
        L'intervention est confirmée. L'intervenant se rendra chez le client à la date prévue.
    </p>
@endsection
