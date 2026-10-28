@extends('emails.layout')

@section('title', 'Intervention confirmée')

@section('content')
    <h1>Votre équipe est constituée</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    @php($teamSize = \App\Support\Brigade::size($mission))
    @if($teamSize > 1)
        <p>Votre équipe est au complet : {{ \App\Support\Brigade::label($teamSize) }} interviendront dans votre logement à la date prévue.</p>
    @else
        <p>Votre intervention est désormais prise en charge par un intervenant certifié Vimaiz.</p>
    @endif

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Date prévue :</strong> {{ ($mission->scheduled_at ?? now())->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property->name ?? ($mission->property->type_label ?? $mission->property->type) }}</p>
        <p><strong>Adresse :</strong> {{ $mission->property->address_line1 }}, {{ $mission->property->postal_code }} {{ $mission->property->city }}</p>
        @if($mission->agent)
            <p><strong>{{ $teamSize > 1 ? 'Intervenant référent' : 'Intervenant' }} :</strong> {{ $mission->agent->name }}</p>
        @endif
    </div>

    <p>Vous serez notifié dès l'arrivée de l'équipe sur place. Vous pouvez échanger avec les intervenants depuis la messagerie de votre espace Vimaiz.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/client/missions/' . $mission->id) }}" class="button">
            Voir les détails
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
