@extends('emails.layout')

@section('title', 'Retour effectué')

@section('content')
    <h1>✅ Retour effectué par l'intervenant</h1>
    
    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>
    
    <p>L'intervenant a terminé le retour demandé par le client.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Intervenant :</strong> {{ $mission->agent->name ?? 'N/A' }}</p>
        <p><strong>Client :</strong> {{ $mission->client->name ?? 'N/A' }}</p>
        <p><strong>Date du retour :</strong> {{ $mission->return_completed_at ? $mission->return_completed_at->format('d/m/Y à H:i') : now()->format('d/m/Y à H:i') }}</p>
    </div>

    @if($mission->return_agent_notes)
    <div class="info-box">
        <p><strong>Notes de l'intervenant :</strong></p>
        <p>{{ $mission->return_agent_notes }}</p>
    </div>
    @endif

    <p style="text-align: center;">
        <a href="{{ config('app.url') }}/admin/missions/{{ $mission->id }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p style="font-size: 13px; color: #64748b; margin-top: 30px;">
        Le client doit maintenant valider le retour. Vous serez notifié de sa décision.
    </p>
@endsection
