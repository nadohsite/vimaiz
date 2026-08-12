@extends('emails.layout')

@section('title', 'Votre intervention a commencé')

@section('content')
    <h1>Votre intervention a commencé ! 🧹</h1>
    
    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>
    
    <p>Bonne nouvelle ! L'intervenant est arrivé et a commencé le nettoyage de votre bien.</p>
    
    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Début :</strong> {{ ($mission->started_at ?? now())->format('d/m/Y à H:i') }}</p>
    </div>
    
    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Durée prévue :</strong> {{ $mission->duration_hours }} heure(s)</p>
    </div>
    
    <p>La présence de l'intervenant sur place a été <strong>vérifiée par géolocalisation</strong> et le début de l'intervention est <strong>horodaté</strong>. Vous pouvez suivre l'avancement depuis votre espace client.</p>
    
    <p style="text-align: center;">
        <a href="{{ url('/client/missions/' . $mission->id) }}" class="button">
            Suivre l'intervention
        </a>
    </p>
    
    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
