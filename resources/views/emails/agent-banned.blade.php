@extends('emails.layout')

@section('title', 'Compte exclu')

@section('content')
    <h1>Votre compte a été définitivement exclu ! 🚫</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Nous avons le regret de vous informer que votre compte intervenant VIMAIZ a été définitivement exclu de notre plateforme.</p>

    <div class="success-box">
        <p><strong>Statut :</strong> Compte exclu</p>
        <p><strong>Date :</strong> {{ now()->format('d/m/Y à H:i') }}</p>
        <p><strong>Décision :</strong> Définitive</p>
    </div>

    <div class="warning-box">
        <p><strong>Raison de l'exclusion :</strong></p>
        <p>{{ $reason }}</p>
        <p>Vous ne pouvez plus vous connecter à votre espace intervenant, vous ne recevrez plus d'interventions et vous ne pourrez plus créer de nouveau compte.</p>
    </div>

    <div class="info-box">
        <p><strong>Concernant vos gains :</strong></p>
        <p>Si vous avez un solde sur votre portefeuille, veuillez nous contacter à <a href="mailto:comptabilite@vimaiz.fr">comptabilite@vimaiz.fr</a> pour organiser le versement de vos gains restants.</p>
        <p>Pour contester cette décision, vous pouvez faire appel en envoyant un courrier recommandé à notre siège social ou en nous contactant à <a href="mailto:reclamations@vimaiz.fr">reclamations@vimaiz.fr</a>.</p>
    </div>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
