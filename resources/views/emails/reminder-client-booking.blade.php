@extends('emails.layout')

@section('title', 'Des intervenants sont disponibles')

@section('content')
    <h1>Des intervenants sont disponibles près de chez vous ! 🧹</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Votre bien est enregistré sur Vimaiz, mais vous n'avez aucune intervention planifiée pour le moment.</p>

    <div class="success-box">
        @if ($availableAgentsCount > 0)
            <p><strong>Intervenants disponibles :</strong> {{ $availableAgentsCount }}</p>
        @else
            <p><strong>Intervenants disponibles :</strong> Oui</p>
        @endif
        <p><strong>Prochaine étape :</strong> Planifier une intervention</p>
    </div>

    <div class="info-box">
        <p><strong>Pourquoi planifier maintenant ?</strong></p>
        <p>• Vous choisissez la date et le créneau</p>
        <p>• Devis clair avant tout paiement</p>
        <p>• Intervention géolocalisée et horodatée</p>
        <p>• Idéal entre deux voyageurs</p>
    </div>

    <p>Programmez votre intervention en quelques clics depuis votre espace client.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/client/requests/create') }}" class="button">
            Planifier une intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
