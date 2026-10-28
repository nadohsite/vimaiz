@extends('emails.layout')

@section('title', 'Recherche d\'un autre intervenant')

@section('content')
    <h1>Remplacement d'un intervenant</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>
        Un intervenant prévu n'est plus disponible pour votre intervention.
        Votre paiement est bien enregistré et rien ne change pour vous : nous le remplaçons automatiquement par un autre professionnel certifié de votre secteur.
    </p>

    <div class="info-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Date prévue :</strong> {{ ($mission->scheduled_at ?? now())->format('d/m/Y à H:i') }}</p>
        <p><strong>Bien :</strong> {{ $mission->property->name ?? ($mission->property->type_label ?? $mission->property->type) }}</p>
    </div>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/client/missions/' . $mission->id) }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
