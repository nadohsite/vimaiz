@extends('emails.layout')

@section('title', 'Nouvelle mission assignée')

@section('content')
    <h1>Nouvelle mission pour vous ! 🏠</h1>
    
    <p>Bonjour {{ $notifiable->name }},</p>
    
    <p>Une nouvelle mission de ménage vous a été attribuée.</p>
    
    <div class="info-box">
        <p><strong>Référence :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Logement :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Surface :</strong> {{ $mission->property->surface_area }} m²</p>
    </div>
    
    <div class="info-box">
        <p><strong>Adresse :</strong></p>
        <p>{{ $mission->property->address_line1 }}</p>
        @if($mission->property->address_line2)
            <p>{{ $mission->property->address_line2 }}</p>
        @endif
        <p>{{ $mission->property->postal_code }} {{ $mission->property->city }}</p>
    </div>
    
    <div class="info-box">
        <p><strong>Date et heure :</strong> {{ $mission->scheduled_at->format('d/m/Y à H:i') }}</p>
        <p><strong>Durée estimée :</strong> {{ $mission->duration_hours }} heure(s)</p>
    </div>
    
    <div class="success-box">
        <p style="font-size: 18px;"><strong>Rémunération : {{ number_format($mission->agent_payout, 2, ',', ' ') }} €</strong></p>
    </div>
    
    <div class="warning-box">
        <p>⚠️ <strong>Important :</strong> Vous avez 30 minutes pour accepter ou refuser cette mission.</p>
    </div>
    
    <p style="text-align: center;">
        <a href="{{ url('/agent/missions/' . $mission->id) }}" class="button">
            Voir la mission
        </a>
    </p>
    
    <p>Bonne mission !<br>L'équipe VIMAIZ</p>
@endsection
