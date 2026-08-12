@extends('emails.layout')

@section('title', 'Intervention confirmée')

@section('content')
    <h1>Intervention confirmée ✅</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Votre intervention est confirmée. Retrouvez toutes les informations dans votre espace.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Date prévue :</strong> {{ ($mission->scheduled_at ?? now())->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Adresse :</strong> {{ $mission->property->address_line1 }}, {{ $mission->property->postal_code }} {{ $mission->property->city }}</p>
        <p><strong>Rémunération :</strong> {{ number_format($mission->agent_payout, 2, ',', ' ') }} €</p>
    </div>

    <p style="text-align: center;">
        <a href="{{ url('/agent/missions/' . $mission->id) }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p>Bonne intervention !<br>L'équipe VIMAIZ</p>
@endsection
