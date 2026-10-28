@extends('emails.layout')

@section('title', 'Votre intervention a commencé')

@section('content')
    <h1>Votre intervention a commencé</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    @php($teamSize = \App\Support\Brigade::size($mission))
    <p>{{ $teamSize > 1 ? "L'équipe est arrivée et l'intervention de ménage a commencé dans votre logement." : "L'intervenant est arrivé et l'intervention de ménage a commencé dans votre logement." }}</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Début :</strong> {{ ($mission->started_at ?? now())->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
    </div>

    <p>L'arrivée sur place a été <strong>confirmée par géolocalisation</strong> et le début de l'intervention est <strong>horodaté</strong>. Suivez son déroulement en temps réel depuis votre espace Vimaiz : vous serez prévenu à la clôture.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/client/missions/' . $mission->id) }}" class="button">
            Suivre l'intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
