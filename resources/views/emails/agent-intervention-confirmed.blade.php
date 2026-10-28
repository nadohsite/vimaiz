@extends('emails.layout')

@section('title', 'Intervention confirmée')

@section('content')
    <h1>Intervention confirmée</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    @php
        $teamSize = \App\Support\Brigade::size($mission);
        $share = \App\Support\Brigade::shareFor($mission, $notifiable->id ?? null);
    @endphp
    <p>Votre place est confirmée{{ $teamSize > 1 ? ' dans une équipe de '.$teamSize.' intervenants' : '' }}. Les consignes du logement et le code d'accès sont dans votre espace intervenant.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Date prévue :</strong> {{ ($mission->scheduled_at ?? now())->format('d/m/Y à H:i') }}</p>
        <p><strong>{{ $teamSize > 1 ? 'Votre part estimée' : 'Votre rémunération' }} :</strong> {{ number_format($share, 2, ',', ' ') }} €</p>
    </div>

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Adresse :</strong> {{ $mission->property->address_line1 }}, {{ $mission->property->postal_code }} {{ $mission->property->city }}</p>
    </div>

    <p>Le jour J, démarrez l'intervention une fois sur place : votre arrivée est confirmée par géolocalisation.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/agent/missions/' . $mission->id) }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
