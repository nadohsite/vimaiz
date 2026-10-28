@extends('emails.layout')

@section('title', 'Bien prêt')

@section('content')
    <h1>Votre logement est prêt</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Merci pour votre validation. Votre logement est prêt à accueillir ses prochains voyageurs et les intervenants vont recevoir leur rémunération.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Bien :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
    </div>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/client/missions/' . $mission->id) }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
