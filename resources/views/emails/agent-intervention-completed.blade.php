@extends('emails.layout')

@section('title', 'Intervention terminée')

@section('content')
    <h1>Intervention terminée</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Merci pour votre travail. L'intervention est clôturée et le compte rendu a été transmis au propriétaire.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Fin :</strong> {{ ($mission->completed_at ?? now())->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Adresse :</strong> {{ $mission->property->address_line1 }}, {{ $mission->property->postal_code }} {{ $mission->property->city }}</p>
    </div>

    <p>Votre part (75 % du montant de l'intervention, répartie entre les intervenants présents) est réservée sur votre portefeuille. Elle devient disponible dès la validation du propriétaire, et au plus tard 48 h après la clôture s'il n'y a pas de contestation.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/agent/missions/' . $mission->id) }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
