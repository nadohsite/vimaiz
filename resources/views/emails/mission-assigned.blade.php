@extends('emails.layout')

@section('title', 'Nouvelle intervention assignée')

@section('content')
    <h1>Nouvelle intervention pour vous ! 🏠</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Une nouvelle intervention est disponible près de chez vous.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Date prévue :</strong> {{ ($mission->scheduled_at ?? now())->format('d/m/Y à H:i') }}</p>
        <p><strong>Rémunération :</strong> {{ number_format($mission->agent_payout, 2, ',', ' ') }} €</p>
    </div>

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Surface :</strong> {{ $mission->property->surface_area }} m²</p>
        <p><strong>Adresse :</strong> {{ $mission->property->address_line1 }}, {{ $mission->property->postal_code }} {{ $mission->property->city }}</p>
        <p><strong>Durée estimée :</strong> {{ $mission->duration_hours }} heure(s)</p>
    </div>

    <div class="warning-box">
        <p>⚠️ <strong>Important :</strong> Vous avez 30 minutes pour accepter ou refuser cette intervention.</p>
    </div>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/agent/missions/' . $mission->id) }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
