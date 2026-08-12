@extends('emails.layout')

@section('title', 'Compte suspendu')

@section('content')
    <h1>Votre compte a été suspendu ! 🚫</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Nous vous informons que votre compte intervenant VIMAIZ a été temporairement suspendu.</p>

    <div class="success-box">
        <p><strong>Statut :</strong> Suspendu</p>
        <p><strong>Du :</strong> {{ now()->format('d/m/Y') }}</p>
        <p><strong>Au :</strong> {{ ($suspendedUntil ?? now())->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="warning-box">
        <p><strong>Raison de la suspension :</strong></p>
        <p>{{ $reason }}</p>
        <p>Durée : {{ now()->diffInDays($suspendedUntil ?? now()) }} jour(s).</p>
    </div>

    <div class="info-box">
        <p><strong>Pendant la suspension :</strong></p>
        <p>Vous ne recevrez plus de nouvelles interventions et vous ne pourrez pas en accepter. Vos gains accumulés restent disponibles et vous pourrez toujours demander un retrait.</p>
        <p>Si vous pensez que cette suspension est injustifiée, contactez-nous à <a href="mailto:contact@vimaiz.com">contact@vimaiz.com</a>.</p>
    </div>

    <p>Votre compte sera automatiquement réactivé le <strong>{{ ($suspendedUntil ?? now())->format('d/m/Y à H:i') }}</strong>.</p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
