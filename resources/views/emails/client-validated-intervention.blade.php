@extends('emails.layout')

@section('title', 'Intervention validée')

@section('content')
    <h1>Intervention validée ✅</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Votre intervention a été validée par le client. Merci pour votre professionnalisme.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Rémunération :</strong> {{ number_format($mission->agent_payout, 2, ',', ' ') }} €</p>
    </div>

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Adresse :</strong> {{ $mission->property->address_line1 }}, {{ $mission->property->postal_code }} {{ $mission->property->city }}</p>
    </div>

    <p style="text-align: center;">
        <a href="{{ url('/agent/missions/' . $mission->id) }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p>Merci pour votre travail !<br>L'équipe VIMAIZ</p>
@endsection
