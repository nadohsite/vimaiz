@extends('emails.layout')

@section('title', 'Nouvelle demande d\'intervention')

@section('content')
    <h1>Nouvelle demande d'intervention</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Une nouvelle demande d'intervention a été soumise et attend votre traitement.</p>

    <div class="success-box">
        <p><strong>Numéro :</strong> {{ $serviceRequest->request_number }}</p>
        <p><strong>Client :</strong> {{ $serviceRequest->client->name ?? 'N/A' }}</p>
        <p><strong>Date souhaitée :</strong> {{ optional($serviceRequest->scheduled_date)->format('d/m/Y') ?? 'Flexible' }}</p>
    </div>

    <div class="info-box">
        <p><strong>Email :</strong> {{ $serviceRequest->client->email ?? 'N/A' }}</p>
        <p><strong>Bien :</strong> {{ $serviceRequest->property->name ?? 'N/A' }} - {{ $serviceRequest->property->city ?? '' }}</p>
        <p><strong>Type :</strong> {{ $serviceRequest->property->type ?? 'N/A' }}</p>
        <p><strong>Surface :</strong> {{ $serviceRequest->property->surface_area ?? 'N/A' }} m²</p>
        @if($serviceRequest->property?->surface_area)
            <p><strong>Équipe à prévoir :</strong> {{ \App\Support\Brigade::label(\App\Support\Brigade::sizeForSurface($serviceRequest->property->surface_area)) }}</p>
        @endif
        <p><strong>Heure :</strong> {{ $serviceRequest->scheduled_time ?? 'Flexible' }}</p>
        @if($serviceRequest->requested_hours)
            <p><strong>Durée demandée :</strong> {{ $serviceRequest->requested_hours }} heures</p>
        @endif
    </div>

    <p>Le propriétaire attend son devis sous 24 h.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ config('app.url') }}/admin/service-requests/{{ $serviceRequest->id }}" class="button">
            Créer le devis
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
