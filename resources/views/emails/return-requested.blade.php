@extends('emails.layout')

@section('title', 'Demande de retour')

@section('content')
    <h1>⚠️ Demande de retour client</h1>
    
    <p>Bonjour {{ $notifiable->name }},</p>
    
    <p>Un client a demandé un retour suite à un mécontentement concernant une mission.</p>

    <div class="warning-box">
        <p><strong>Mission :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Client :</strong> {{ $mission->client->name ?? 'N/A' }}</p>
        <p><strong>Email client :</strong> {{ $mission->client->email ?? 'N/A' }}</p>
        <p><strong>Agent :</strong> {{ $mission->agent->name ?? 'Non attribué' }}</p>
        <p><strong>Date de la mission :</strong> {{ $mission->scheduled_at ? $mission->scheduled_at->format('d/m/Y à H:i') : 'N/A' }}</p>
    </div>

    <div class="info-box">
        <p><strong>Raison du mécontentement :</strong></p>
        <p>{{ $mission->return_reason }}</p>
    </div>

    <p style="text-align: center;">
        <a href="{{ config('app.url') }}/admin/missions/{{ $mission->id }}" class="button">
            Voir la mission
        </a>
    </p>

    <p style="font-size: 13px; color: #64748b; margin-top: 30px;">
        L'agent sera notifié pour effectuer le retour. Suivez l'évolution depuis le panneau d'administration.
    </p>
@endsection
