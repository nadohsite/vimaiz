@extends('emails.layout')

@section('title', 'Intervention refusée')

@section('content')
    <h1>Intervention refusée par l'intervenant ! ❌</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Un intervenant a refusé une intervention qui lui a été proposée.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Intervenant :</strong> {{ $agentName ?? 'N/A' }}</p>
        <p><strong>Date prévue :</strong> {{ ($mission->scheduled_at ?? now())->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="warning-box">
        <p><strong>Client :</strong> {{ $mission->client->name ?? 'N/A' }}</p>
        @if($reason)
            <p><strong>Raison du refus :</strong> {{ $reason }}</p>
        @endif
    </div>

    <div class="info-box">
        <p>L'intervention sera automatiquement réattribuée à un autre intervenant disponible si possible.</p>
    </div>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ config('app.url') }}/admin/missions/{{ $mission->id }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
