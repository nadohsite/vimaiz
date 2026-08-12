@extends('emails.layout')

@section('title', 'Intervention confirmée')

@section('content')
    <h1>Intervention prise en charge ✅</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Votre intervention est désormais prise en charge. Un intervenant Vimaiz a été assigné à votre bien.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Date prévue :</strong> {{ ($mission->scheduled_at ?? now())->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property->name ?? ($mission->property->type_label ?? $mission->property->type) }}</p>
        <p><strong>Adresse :</strong> {{ $mission->property->address_line1 }}, {{ $mission->property->postal_code }} {{ $mission->property->city }}</p>
        @if($mission->agent)
            <p><strong>Intervenant :</strong> {{ $mission->agent->name }}</p>
        @endif
    </div>

    <p style="text-align: center;">
        <a href="{{ url('/client/missions/' . $mission->id) }}" class="button">
            Voir les détails
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
