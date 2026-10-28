@extends('emails.layout')

@section('title', 'Documents validés')

@section('content')
    <h1>Félicitations ! Vos documents sont validés</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Excellente nouvelle ! Votre profil intervenant a été vérifié avec succès. Tous vos documents ont été validés par notre équipe.</p>

    <div class="success-box">
        <p><strong>Statut :</strong> Vérifié</p>
        <p><strong>Date :</strong> {{ now()->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="info-box">
        <p><strong>Vous pouvez désormais :</strong></p>
        <p>Recevoir des interventions dans de grandes résidences de votre secteur, les accepter ou les refuser selon vos disponibilités, et retirer vos gains vers votre compte bancaire.</p>
        <p>Vous ne serez jamais seul face à un grand logement : Vimaiz co-assigne d'autres intervenants certifiés pour qu'aucun ne prenne en charge plus de 125 m². Vous percevez 75 % du montant de l'intervention.</p>
    </div>

    <p>Nous vous souhaitons beaucoup de succès sur VIMAIZ !</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/agent/dashboard') }}" class="button">
            Accéder à mon espace intervenant
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
