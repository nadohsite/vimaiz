@extends('emails.layout')

@section('title', 'Nouvelle intervention proposée')

@section('content')
    <h1>Une intervention vous est proposée</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    @php
        $teamSize = \App\Support\Brigade::size($mission);
        $share = \App\Support\Brigade::shareFor($mission);
    @endphp
    @if($teamSize > 1)
        <p>Une intervention en équipe est disponible : {{ $teamSize }} intervenants certifiés se répartissent le logement, sans jamais dépasser 125 m² chacun. Acceptez-la pour réserver votre place.</p>
    @else
        <p>Une nouvelle intervention est disponible. Acceptez-la pour la réserver.</p>
    @endif

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Date prévue :</strong> {{ ($mission->scheduled_at ?? now())->copy()->timezone('Europe/Paris')->format('d/m/Y à H:i') }}</p>
        <p><strong>{{ $teamSize > 1 ? 'Votre part estimée' : 'Votre rémunération' }} :</strong> {{ number_format($share, 2, ',', ' ') }} €</p>
        @if($teamSize > 1)
            <p><strong>Équipe :</strong> {{ $teamSize }} intervenants</p>
        @endif
    </div>

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property?->name ?? $mission->property?->type ?? '—' }}</p>
        @if($mission->property?->surface_area)
            <p><strong>Surface :</strong> {{ $mission->property->surface_area }} m²</p>
        @endif
        @if($mission->property)
            <p><strong>Adresse :</strong> {{ $mission->property->address_line1 }}, {{ $mission->property->postal_code }} {{ $mission->property->city }}</p>
        @endif
    </div>

    <div class="warning-box">
        <p><strong>Important :</strong> plusieurs intervenants de votre secteur reçoivent cette proposition. Les places sont attribuées aux premiers qui acceptent.</p>
        @if($teamSize > 1)
            <p>Le montant définitif de votre part est calculé à la clôture, sur l'équipe réellement présente : il ne peut qu'augmenter si un intervenant se désiste.</p>
        @endif
    </div>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/agent/missions/' . $mission->id) }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
