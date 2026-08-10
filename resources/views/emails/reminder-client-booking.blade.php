@extends('emails.layout')

@section('title', 'Des intervenants sont disponibles')

@section('content')
    <h1>Des intervenants sont disponibles près de chez vous 🧹</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>
        Votre bien est enregistré sur VIMAIZ, mais vous n'avez aucune intervention
        planifiée pour le moment. Bonne nouvelle :
        @if ($availableAgentsCount > 0)
            <strong>{{ $availableAgentsCount }} intervenant{{ $availableAgentsCount > 1 ? 's' : '' }}
            vérifié{{ $availableAgentsCount > 1 ? 's sont' : ' est' }} disponible{{ $availableAgentsCount > 1 ? 's' : '' }}</strong>
            et prêt{{ $availableAgentsCount > 1 ? 's' : '' }} à intervenir.
        @else
            <strong>nos intervenants vérifiés sont disponibles</strong> et prêts à intervenir.
        @endif
    </p>

    <div class="success-box">
        <p><strong>Pourquoi planifier maintenant ?</strong></p>
        <p>✅ Vous choisissez la date et le créneau qui vous arrangent</p>
        <p>✅ Devis clair avant tout paiement</p>
        <p>✅ Intervention géolocalisée et horodatée à chaque intervention</p>
        <p>✅ Idéal entre deux voyageurs pour vos locations</p>
    </div>

    <p style="text-align: center;">
        <a href="{{ url('/client/requests/create') }}" class="button">
            Planifier une intervention
        </a>
    </p>

    <p>
        Une question sur nos prestations ? Répondez à cet email ou contactez-nous à
        <a href="mailto:contact@vimaiz.com">contact@vimaiz.com</a> — nous vous
        répondons sous 24h.
    </p>

    <p>L'équipe VIMAIZ</p>
@endsection
