@extends('emails.layout')

@section('title', 'Votre bien est prêt à être organisé')

@section('content')
    <h1>Votre bien est prêt à être organisé.</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Bienvenue sur Vimaiz.</p>

    <p>
        Votre espace est maintenant prêt. Il ne vous reste plus qu’à ajouter votre
        premier bien pour commencer à organiser vos interventions simplement.
    </p>

    <div class="info-box">
        <p><strong>En quelques minutes :</strong></p>
        <p>1. Ajoutez votre bien et ses informations</p>
        <p>2. Programmez votre intervention</p>
        <p>3. Suivez son avancement depuis votre espace Vimaiz</p>
    </div>

    <p>
        Une organisation simple, pensée pour que votre bien soit prêt à accueillir
        ses prochains voyageurs.
    </p>

    <p style="text-align: center;">
        <a href="{{ url('/client/properties/create') }}" class="button">
            Ajouter mon bien →
        </a>
    </p>

    <p>
        À bientôt,<br>
        L’équipe Vimaiz
    </p>
@endsection
