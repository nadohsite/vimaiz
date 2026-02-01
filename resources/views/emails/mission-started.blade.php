@extends('emails.layout')

@section('title', 'Votre ménage a commencé')

@section('content')
    <h1>Votre ménage a commencé ! 🧹</h1>
    
    <p>Bonjour {{ $notifiable->name }},</p>
    
    <p>Bonne nouvelle ! L'agent de ménage est arrivé et a commencé le nettoyage de votre logement.</p>
    
    <div class="success-box">
        <p><strong>Mission :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Début :</strong> {{ $mission->started_at->format('d/m/Y à H:i') }}</p>
    </div>
    
    <div class="info-box">
        <p><strong>Logement :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Durée prévue :</strong> {{ $mission->duration_hours }} heure(s)</p>
    </div>
    
    <p>L'agent a pris des photos <strong>AVANT</strong> intervention qui seront disponibles dans votre espace client une fois la mission terminée.</p>
    
    <p style="text-align: center;">
        <a href="{{ url('/client/missions/' . $mission->id) }}" class="button">
            Suivre la mission
        </a>
    </p>
    
    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
