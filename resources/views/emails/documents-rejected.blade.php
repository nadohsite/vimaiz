@extends('emails.layout')

@section('title', 'Documents rejetés')

@section('content')
    <h1>Documents rejetés — action requise ⚠️</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Nous avons examiné vos documents, mais nous ne pouvons pas les valider en l'état.</p>

    <div class="success-box">
        <p><strong>Statut :</strong> Rejetés</p>
        <p><strong>Action :</strong> Merci de renvoyer des documents conformes</p>
    </div>

    <div class="warning-box">
        <p><strong>Raison du rejet :</strong></p>
        <p>{{ $reason }}</p>
    </div>

    <div class="info-box">
        <p><strong>Que faire maintenant ?</strong></p>
        <p>1. Connectez-vous à votre espace intervenant</p>
        <p>2. Accédez à « Mes documents »</p>
        <p>3. Téléversez des documents lisibles et à jour</p>
        <p>4. Soumettez à nouveau pour vérification</p>
    </div>

    <p>Assurez-vous que les photos sont nettes, complètes et que les documents sont encore valides.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/agent/documents') }}" class="button">
            Corriger mes documents
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
