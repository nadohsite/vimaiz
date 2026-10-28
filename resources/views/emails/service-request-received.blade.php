@extends('emails.layout')

@section('title', 'Demande bien reçue')

@section('content')
    <h1>Votre demande a bien été reçue</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Nous avons bien enregistré votre demande d'intervention. Notre équipe vous envoie un devis forfaitaire sous 24 h, sans frais caché.</p>

    <div class="success-box">
        <p><strong>Demande :</strong> {{ $serviceRequest->request_number }}</p>
        <p><strong>Date souhaitée :</strong> {{ optional($serviceRequest->scheduled_date)->format('d/m/Y') ?? '—' }}
            @if($serviceRequest->scheduled_time)
                à {{ $serviceRequest->scheduled_time }}
            @endif
        </p>
    </div>

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $serviceRequest->property->name ?? $serviceRequest->property->type ?? 'N/A' }}</p>
        <p><strong>Ville :</strong> {{ $serviceRequest->property->city ?? '—' }}</p>
        @if($serviceRequest->property?->surface_area)
            <p><strong>Surface :</strong> {{ $serviceRequest->property->surface_area }} m²</p>
            <p><strong>Équipe prévue :</strong> {{ \App\Support\Brigade::label(\App\Support\Brigade::sizeForSurface($serviceRequest->property->surface_area)) }}</p>
        @endif
    </div>

    <p>Pour garantir une exécution soignée dans la journée, Vimaiz dimensionne l'équipe selon la superficie de votre logement : jamais plus de 125 m² par intervenant, sans surcoût logistique pour vous.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/client/requests/' . $serviceRequest->id) }}" class="button">
            Suivre ma demande
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
