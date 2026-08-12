@extends('emails.layout')

@section('title', 'Intervention terminée')

@section('content')
    <h1>Intervention terminée ! 🎉</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Merci. Votre intervention est terminée. Le client va maintenant la confirmer.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Fin :</strong> {{ $mission->completed_at?->format('d/m/Y à H:i') ?? now()->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Adresse :</strong> {{ $mission->property->address_line1 }}, {{ $mission->property->postal_code }} {{ $mission->property->city }}</p>
    </div>

    <p>Dès validation par le client, votre paiement sera crédité sur votre portefeuille.</p>

    <p style="text-align: center;">
        <a href="{{ url('/agent/missions/' . $mission->id) }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p>Merci pour votre travail !<br>L'équipe VIMAIZ</p>
@endsection
