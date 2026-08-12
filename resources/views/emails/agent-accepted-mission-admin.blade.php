@extends('emails.layout')

@section('title', 'Intervention acceptée')

@section('content')
    <h1>Intervention acceptée par l'intervenant ! ✅</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Un intervenant a accepté une intervention qui lui a été proposée.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Intervenant :</strong> {{ $mission->agent->name ?? 'N/A' }}</p>
        <p><strong>Date prévue :</strong> {{ ($mission->scheduled_at ?? now())->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="info-box">
        <p><strong>Client :</strong> {{ $mission->client->name ?? 'N/A' }}</p>
        <p><strong>Montant total :</strong> {{ number_format($mission->total_price, 2, ',', ' ') }} €</p>
        <p>L'intervention est confirmée. L'intervenant se rendra chez le client à la date prévue.</p>
    </div>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ config('app.url') }}/admin/missions/{{ $mission->id }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
