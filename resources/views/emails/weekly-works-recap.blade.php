@extends('emails.layout')

@section('title', 'Votre récap de la semaine')

@section('content')
    <h1>Voici le récap de vos interventions.</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>
        Voici un aperçu de votre activité Vimaiz pour la semaine du
        <strong>{{ $weekLabel }}</strong>.
    </p>

    <div class="info-box">
        <p><strong>Interventions terminées :</strong> {{ $completedMissions->count() }}</p>
        <p><strong>Interventions à venir :</strong> {{ $upcomingMissions->count() }}</p>
    </div>

    @if ($completedMissions->isNotEmpty())
        <p><strong>Terminées la semaine dernière</strong></p>
        <div class="info-box">
            @foreach ($completedMissions as $mission)
                <p>
                    • {{ $mission->mission_number }}
                    — {{ $mission->property_label }}
                    @if (!empty($mission->completed_at_label))
                        ({{ $mission->completed_at_label }})
                    @endif
                    @if ($role === 'agent' && isset($mission->amount_label))
                        — {{ $mission->amount_label }}
                    @elseif ($role === 'client' && isset($mission->amount_label))
                        — {{ $mission->amount_label }}
                    @endif
                </p>
            @endforeach
        </div>
    @endif

    @if ($upcomingMissions->isNotEmpty())
        <p><strong>À venir cette semaine</strong></p>
        <div class="success-box">
            @foreach ($upcomingMissions as $mission)
                <p>
                    • {{ $mission->mission_number }}
                    — {{ $mission->property_label }}
                    @if (!empty($mission->scheduled_at_label))
                        ({{ $mission->scheduled_at_label }})
                    @endif
                </p>
            @endforeach
        </div>
    @endif

    @if ($completedMissions->isEmpty() && $upcomingMissions->isEmpty())
        <p>
            Aucune intervention à signaler pour cette période.
            @if ($role === 'client')
                C’est le bon moment pour organiser la prochaine.
            @else
                De nouvelles interventions arriveront bientôt dans votre espace.
            @endif
        </p>
    @endif

    <p style="text-align: center;">
        <a href="{{ $role === 'agent' ? url('/agent/dashboard') : url('/dashboard') }}" class="button">
            Voir mon espace →
        </a>
    </p>

    <p>
        À bientôt,<br>
        L’équipe Vimaiz
    </p>
@endsection
