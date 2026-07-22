@extends('emails.layout')

@section('title', 'Des agents sont disponibles')

@section('content')
    <h1>Des agents sont disponibles près de chez vous 🧹</h1>

    <p>Bonjour {{ $notifiable->name }},</p>

    <p>
        Votre logement est enregistré sur VIMAIZ, mais vous n'avez aucun ménage
        planifié pour le moment. Bonne nouvelle :
        @if ($availableAgentsCount > 0)
            <strong>{{ $availableAgentsCount }} agent{{ $availableAgentsCount > 1 ? 's' : '' }}
            vérifié{{ $availableAgentsCount > 1 ? 's sont' : ' est' }} disponible{{ $availableAgentsCount > 1 ? 's' : '' }}</strong>
            et prêt{{ $availableAgentsCount > 1 ? 's' : '' }} à intervenir.
        @else
            <strong>nos agents vérifiés sont disponibles</strong> et prêts à intervenir.
        @endif
    </p>

    <div class="success-box">
        <p><strong>Pourquoi planifier maintenant ?</strong></p>
        <p>✅ Vous choisissez la date et le créneau qui vous arrangent</p>
        <p>✅ Devis clair avant tout paiement</p>
        <p>✅ Intervention géolocalisée et horodatée à chaque mission</p>
        <p>✅ Idéal entre deux voyageurs pour vos locations</p>
    </div>

    <p style="text-align: center;">
        <a href="{{ url('/client/requests/create') }}" class="button">
            Planifier un ménage
        </a>
    </p>

    <p>
        Une question sur nos prestations ? Répondez à cet email ou contactez-nous à
        <a href="mailto:contact@vimaiz.com">contact@vimaiz.com</a> — nous vous
        répondons sous 24h.
    </p>

    <p>L'équipe VIMAIZ</p>
@endsection
