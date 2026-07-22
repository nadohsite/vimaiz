@extends('emails.layout')

@section('title', 'Ménage terminé')

@section('content')
    <h1>Ménage terminé ! 🎉</h1>
    
    <p>Bonjour {{ $notifiable->name }},</p>
    
    <p>Le ménage de votre logement est terminé avec succès !</p>
    
    <div class="success-box">
        <p><strong>Mission :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Statut :</strong> ✅ Terminée</p>
    </div>
    
    <div class="info-box">
        <p><strong>Logement :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Début :</strong> {{ $mission->started_at?->format('d/m/Y à H:i') }}</p>
        <p><strong>Fin :</strong> {{ $mission->completed_at?->format('d/m/Y à H:i') }}</p>
        @php
            $duration = $mission->started_at && $mission->completed_at 
                ? $mission->started_at->diffInMinutes($mission->completed_at) 
                : $mission->duration_hours * 60;
        @endphp
        <p><strong>Durée effective :</strong> {{ floor($duration / 60) }}h{{ $duration % 60 > 0 ? sprintf('%02d', $duration % 60) : '' }}</p>
    </div>
    
    <p>La mission a été <strong>géolocalisée</strong> et <strong>horodatée</strong> : le début et la fin de l'intervention sont enregistrés ci-dessus. Retrouvez tous les détails dans votre espace client.</p>
    
    <p style="text-align: center;">
        <a href="{{ url('/client/missions/' . $mission->id) }}" class="button">
            Voir la mission
        </a>
    </p>
    
    <p>Merci de votre confiance. À bientôt sur VIMAIZ !</p>
    
    <p>L'équipe VIMAIZ</p>
@endsection
