@extends('emails.layout')

@section('title', 'Intervention terminée')

@section('content')
    <h1>Intervention terminée ! 🎉</h1>
    
    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>
    
    <p>L'intervention sur votre bien est terminée. Il ne vous reste plus qu'à confirmer que tout est conforme.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Statut :</strong> ✅ Terminée — à confirmer</p>
    </div>
    
    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Début :</strong> {{ $mission->started_at?->format('d/m/Y à H:i') }}</p>
        <p><strong>Fin :</strong> {{ $mission->completed_at?->format('d/m/Y à H:i') }}</p>
        @php
            $duration = $mission->started_at && $mission->completed_at 
                ? $mission->started_at->diffInMinutes($mission->completed_at) 
                : $mission->duration_hours * 60;
        @endphp
        <p><strong>Durée effective :</strong> {{ floor($duration / 60) }}h{{ $duration % 60 > 0 ? sprintf('%02d', $duration % 60) : '' }}</p>
    </div>
    
    <p>L'intervention a été <strong>géolocalisée</strong> et <strong>horodatée</strong> : le début et la fin de l'intervention sont enregistrés ci-dessus. Retrouvez tous les détails dans votre espace client.</p>
    
    <p style="text-align: center;">
        <a href="{{ url('/client/missions/' . $mission->id) }}" class="button">
            Confirmer l'intervention
        </a>
    </p>
    
    <p>Merci de votre confiance. À bientôt sur VIMAIZ !</p>
    
    <p>L'équipe VIMAIZ</p>
@endsection
