@extends('emails.layout')

@section('title', 'Paiement confirmé')

@section('content')
    <h1>Votre intervention est confirmée</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    @php($teamSize = \App\Support\Brigade::size($mission))
    <p>Votre paiement a bien été reçu. Votre intervention est enregistrée et nous constituons votre équipe : {{ \App\Support\Brigade::label($teamSize) }}.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Montant payé :</strong> {{ number_format($mission->total_price, 2, ',', ' ') }} €</p>
        <p><strong>Date de paiement :</strong> {{ now()->timezone('Europe/Paris')->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Adresse :</strong> {{ $mission->property->address_line1 }}, {{ $mission->property->postal_code }} {{ $mission->property->city }}</p>
        <p><strong>Date de la prestation :</strong> {{ ($mission->scheduled_at ?? now())->copy()->timezone('Europe/Paris')->format('d/m/Y à H:i') }}</p>
    </div>

    <p>Vous serez prévenu dès que l'équipe sera au complet, puis à l'arrivée des intervenants sur place, confirmée par géolocalisation. Votre paiement reste sécurisé : il n'est versé aux intervenants qu'après votre validation. Votre facture est disponible dans votre espace Vimaiz.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/client/missions/' . $mission->id) }}" class="button">
            Suivre l'intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
