@extends('emails.layout')

@section('title', 'Nouvelle demande d'intervention')

@section('content')
    <h1>🏠 Nouvelle demande d'intervention</h1>
    
    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>
    
    <p>Une nouvelle demande d'intervention a été soumise et attend votre traitement.</p>

    <div class="info-box">
        <p><strong>Numéro :</strong> {{ $serviceRequest->request_number }}</p>
        <p><strong>Client :</strong> {{ $serviceRequest->client->name ?? 'N/A' }}</p>
        <p><strong>Email :</strong> {{ $serviceRequest->client->email ?? 'N/A' }}</p>
        <p><strong>Bien :</strong> {{ $serviceRequest->property->name ?? 'N/A' }} - {{ $serviceRequest->property->city ?? '' }}</p>
        <p><strong>Type :</strong> {{ $serviceRequest->property->type ?? 'N/A' }}</p>
        <p><strong>Surface :</strong> {{ $serviceRequest->property->surface_area ?? 'N/A' }} m²</p>
        <p><strong>Date souhaitée :</strong> {{ $serviceRequest->scheduled_date ? $serviceRequest->scheduled_date->format('d/m/Y') : 'Flexible' }}</p>
        <p><strong>Heure :</strong> {{ $serviceRequest->scheduled_time ?? 'Flexible' }}</p>
        <p><strong>Durée demandée :</strong> {{ $serviceRequest->requested_hours }} heures</p>
    </div>

    <p style="text-align: center;">
        <a href="{{ config('app.url') }}/admin/service-requests/{{ $serviceRequest->id }}" class="button">
            Créer le devis
        </a>
    </p>

    <p style="font-size: 13px; color: #64748b; margin-top: 30px;">
        Merci de traiter cette demande rapidement pour maintenir un bon niveau de service.
    </p>
@endsection
