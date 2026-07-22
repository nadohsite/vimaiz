@extends('emails.layout')

@section('title', 'Ajoutez votre logement')

@section('content')
    <h1>Votre logement mérite un ménage impeccable ✨</h1>

    <p>Bonjour {{ $notifiable->name }},</p>

    <p>
        Bienvenue sur VIMAIZ ! Il ne vous reste qu'une étape pour profiter de
        nos services : <strong>ajouter votre premier logement</strong>
        (appartement, maison, villa ou chalet).
    </p>

    <div class="info-box">
        <p><strong>En 2 minutes :</strong></p>
        <p>1. Ajoutez votre logement et ses spécificités</p>
        <p>2. Choisissez une date et un créneau</p>
        <p>3. Un agent vérifié s'occupe du reste</p>
    </div>

    <p>
        Nos agents sont vérifiés (SIRET et documents contrôlés), le paiement est
        sécurisé et chaque intervention est géolocalisée et horodatée : l'agent
        démarre sa mission sur place, à proximité immédiate de votre logement.
    </p>

    <p style="text-align: center;">
        <a href="{{ url('/client/properties/create') }}" class="button">
            Ajouter mon logement
        </a>
    </p>

    <p>L'équipe VIMAIZ</p>
@endsection
