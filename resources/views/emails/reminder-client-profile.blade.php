@extends('emails.layout')

@section('title', 'Ajoutez votre logement')

@section('content')
    <h1>Ajoutez votre grande résidence pour démarrer</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Votre espace Vimaiz est prêt. Ajoutez votre grande résidence (200 m² et plus) pour organiser et suivre à distance ses interventions de ménage.</p>

    <div class="success-box">
        <p><strong>Statut :</strong> Compte créé</p>
        <p><strong>Prochaine étape :</strong> Ajouter un logement</p>
    </div>

    <div class="info-box">
        <p><strong>En quelques minutes :</strong></p>
        <p>1. Ajoutez votre logement et ses exigences : elles deviennent la feuille de route permanente des intervenants</p>
        <p>2. Programmez votre intervention</p>
        <p>3. Suivez son déroulement en temps réel, où que vous soyez</p>
    </div>

    <p>Vimaiz devient vos yeux là où vous n'en avez pas, pour préserver la réputation de votre patrimoine.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/client/properties/create') }}" class="button">
            Ajouter mon bien
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
