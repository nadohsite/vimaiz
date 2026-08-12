@extends('emails.layout')

@section('title', 'Complétez votre profil intervenant')

@section('content')
    <h1>Votre profil est presque prêt ! 🚀</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Votre inscription intervenant a bien démarré, mais votre profil n'est pas encore complet. Tant qu'il ne l'est pas, vous ne pouvez pas recevoir d'interventions.</p>

    <div class="success-box">
        <p><strong>Statut :</strong> Profil incomplet</p>
        <p><strong>Objectif :</strong> Finaliser pour recevoir des interventions</p>
    </div>

    @if (!empty($missingItems))
        <div class="warning-box">
            <p><strong>Il vous manque :</strong></p>
            @foreach ($missingItems as $item)
                <p>• {{ $item }}</p>
            @endforeach
        </div>
    @endif

    <div class="info-box">
        <p><strong>En quelques minutes :</strong></p>
        <p>1. Complétez les informations manquantes</p>
        <p>2. Déposez vos documents</p>
        <p>3. Attendez la validation de notre équipe</p>
    </div>

    <p>Quelques minutes suffisent pour finaliser et commencer à recevoir des missions.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/agent/documents') }}" class="button">
            Compléter mon profil
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
