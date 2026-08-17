@extends('emails.layout')

@section('title', 'Intervention sans intervenant')

@section('content')
    <h1>Attribution manuelle requise</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>
        Aucun intervenant éligible n'a pu être assigné automatiquement
        à l'intervention <strong>{{ $mission->mission_number }}</strong> (déjà payée).
    </p>

    <div class="info-box">
        <p><strong>Date prévue :</strong> {{ ($mission->scheduled_at ?? now())->format('d/m/Y à H:i') }}</p>
        <p><strong>Bien :</strong> {{ $mission->property->name ?? ($mission->property->type_label ?? $mission->property->type) }}</p>
        <p><strong>Ville :</strong> {{ $mission->property->city ?? '—' }} {{ $mission->property->postal_code ?? '' }}</p>
    </div>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/admin/missions/' . $mission->id) }}" class="button">
            Attribuer un intervenant
        </a>
    </p>
@endsection
