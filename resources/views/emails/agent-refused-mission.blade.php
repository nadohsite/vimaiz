@extends('emails.layout')

@section('title', 'Mission refusée')

@section('content')
    <h1>❌ Mission refusée par l'agent</h1>
    
    <p>Bonjour {{ $notifiable->name }},</p>
    
    <p>Un agent a refusé une mission qui lui a été proposée.</p>

    <div class="warning-box">
        <p><strong>Mission :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Agent :</strong> {{ $agentName ?? 'N/A' }}</p>
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
            Voir la mission
        </a>
    </p>

    <p style="font-size: 13px; color: #64748b; margin-top: 30px;">
        La mission sera automatiquement réattribuée à un autre agent disponible si possible.
    </p>
@endsection
