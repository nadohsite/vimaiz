@extends('emails.layout')

@section('title', 'Compte exclu')

@section('content')
    <h1>Votre compte a été définitivement exclu</h1>
    
    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>
    
    <p>Nous avons le regret de vous informer que votre compte intervenant VIMAIZ a été définitivement exclu de notre plateforme.</p>
    
    <div class="warning-box" style="background-color: #fef2f2; border-left-color: #dc2626;">
        <p style="color: #991b1b;"><strong>Raison de l'exclusion :</strong></p>
        <p style="margin-top: 10px; color: #991b1b;">{{ $reason }}</p>
    </div>
    
    <h2 style="margin-top: 30px;">Conséquences</h2>
    
    <p>Cette décision est définitive et signifie que :</p>
    <ul style="margin: 20px 0; padding-left: 20px;">
        <li>❌ Vous ne pouvez plus vous connecter à votre espace intervenant</li>
        <li>❌ Vous ne recevrez plus d'interventions</li>
        <li>❌ Vous ne pourrez plus créer de nouveau compte</li>
    </ul>
    
    <div class="info-box">
        <p><strong>Concernant vos gains :</strong></p>
        <p style="margin-top: 10px;">
            Si vous avez un solde sur votre portefeuille, veuillez nous contacter à 
            <a href="mailto:comptabilite@vimaiz.fr">comptabilite@vimaiz.fr</a> 
            pour organiser le versement de vos gains restants.
        </p>
    </div>
    
    <h2 style="margin-top: 30px;">Contestation</h2>
    
    <p>Si vous pensez que cette décision est injustifiée, vous pouvez faire appel en envoyant un courrier recommandé à notre siège social ou en nous contactant à <a href="mailto:reclamations@vimaiz.fr">reclamations@vimaiz.fr</a>.</p>
    
    <p>Cordialement,<br>L'équipe VIMAIZ</p>
@endsection
