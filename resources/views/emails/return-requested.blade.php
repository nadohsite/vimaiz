@extends('emails.layout')

@section('title', 'Demande de retour')

@section('content')
    <h1>Demande de nouveau passage</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Un propriétaire a demandé un nouveau passage ciblé dans le délai de 48 h suivant la clôture. Le paiement des intervenants reste retenu jusqu'à la résolution.</p>

    <div class="info-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Client :</strong> {{ $mission->client->name ?? 'N/A' }}</p>
        <p><strong>Date de l'intervention :</strong> {{ ($mission->scheduled_at ?? now())->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="warning-box">
        <p><strong>Email client :</strong> {{ $mission->client->email ?? 'N/A' }}</p>
        <p><strong>Intervenant :</strong> {{ $mission->agent->name ?? 'Non attribué' }}</p>
        <p><strong>Raison du mécontentement :</strong></p>
        <p>{{ $mission->return_reason }}</p>
    </div>

    <div class="info-box">
        <p>L'intervenant sera notifié pour effectuer le retour. Suivez l'évolution depuis le panneau d'administration.</p>
    </div>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ config('app.url') }}/admin/missions/{{ $mission->id }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
