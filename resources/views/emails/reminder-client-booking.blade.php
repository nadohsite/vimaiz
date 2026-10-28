@extends('emails.layout')

@section('title', 'Planifiez votre prochaine intervention')

@section('content')
    <h1>Préparez la prochaine arrivée de vos voyageurs</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Votre logement est enregistré sur Vimaiz, mais aucune intervention n'est planifiée pour le moment. Préparez dès maintenant l'arrivée de vos prochains voyageurs, même à distance.</p>

    <div class="success-box">
        <p><strong>Votre logement :</strong> enregistré, prêt à être pris en charge</p>
        <p><strong>Prochaine étape :</strong> Planifier une intervention</p>
    </div>

    <div class="info-box">
        <p><strong>Pourquoi planifier maintenant ?</strong></p>
        <p>• Vous choisissez la date selon les rotations de vos voyageurs</p>
        <p>• Devis forfaitaire clair avant tout paiement, sans frais caché</p>
        <p>• Une équipe dimensionnée selon la superficie de votre logement</p>
        <p>• Arrivée confirmée par géolocalisation, suivi en temps réel</p>
        <p>• 48 h pour valider le rapport avant tout paiement des intervenants</p>
    </div>

    <p>Programmez votre intervention en quelques clics depuis votre espace client.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/client/requests/create') }}" class="button">
            Planifier une intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
