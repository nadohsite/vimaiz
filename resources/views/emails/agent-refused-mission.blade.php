@extends('emails.layout')

@section('title', 'Intervention refusée')

@section('content')
    <h1>❌ Intervention refusée par l'intervenant</h1>
    
    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>
    
    <p>Un intervenant a refusé une intervention qui lui a été proposée.</p>

    <div class="warning-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Intervenant :</strong> {{ $agentName ?? 'N/A' }}</p>
        <p><strong>Client :</strong> {{ $mission->client->name ?? 'N/A' }}</p>
        <p><strong>Date prévue :</strong> {{ $mission->scheduled_at ? $mission->scheduled_at->format('d/m/Y à H:i') : 'N/A' }}</p>
    </div>

    @if($reason)
    <div class="info-box">
        <p><strong>Raison du refus :</strong></p>
        <p>{{ $reason }}</p>
    </div>
    @endif

    <p style="text-align: center;">
        <a href="{{ config('app.url') }}/admin/missions/{{ $mission->id }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p style="font-size: 13px; color: #64748b; margin-top: 30px;">
        L'intervention sera automatiquement réattribuée à un autre intervenant disponible si possible.
    </p>
@endsection
