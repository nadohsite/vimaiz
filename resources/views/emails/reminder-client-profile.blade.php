@extends('emails.layout')

@section('title', 'Ajoutez votre logement')

@section('content')
    <h1>Ajoutez votre logement pour démarrer ! 🏠</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Votre espace Vimaiz est prêt. Il ne vous reste plus qu'à ajouter votre premier bien pour organiser vos interventions.</p>

    <div class="success-box">
        <p><strong>Statut :</strong> Compte créé</p>
        <p><strong>Prochaine étape :</strong> Ajouter un logement</p>
    </div>

    <div class="info-box">
        <p><strong>En quelques minutes :</strong></p>
        <p>1. Ajoutez votre bien et ses informations</p>
        <p>2. Programmez votre intervention</p>
        <p>3. Suivez son avancement depuis votre espace</p>
    </div>

    <p>Une organisation simple, pensée pour que votre bien soit prêt à accueillir ses prochains voyageurs.</p>

    <p style="text-align: center;">
        <a href="{{ url('/client/properties/create') }}" class="button">
            Ajouter mon bien
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
