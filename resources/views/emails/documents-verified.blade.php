@extends('emails.layout')

@section('title', 'Documents validés')

@section('content')
    <h1>Félicitations ! Vos documents sont validés 🎉</h1>
    
    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>
    
    <p>Excellente nouvelle ! Votre profil intervenant a été vérifié avec succès. Tous vos documents ont été validés par notre équipe.</p>
    
    <div class="success-box">
        <p><strong>✅ Statut :</strong> Vérifié</p>
        <p><strong>📅 Date :</strong> {{ now()->format('d/m/Y à H:i') }}</p>
    </div>
    
    <h2 style="margin-top: 30px;">Que se passe-t-il maintenant ?</h2>
    
    <p>Vous pouvez désormais :</p>
    <ul style="margin: 20px 0; padding-left: 20px;">
        <li>✅ Recevoir des interventions</li>
        <li>✅ Accepter ou refuser les interventions proposées</li>
        <li>✅ Gagner de l'argent sur chaque intervention terminée</li>
        <li>✅ Retirer vos gains vers votre compte bancaire</li>
    </ul>
    
    <p style="text-align: center;">
        <a href="{{ url('/agent/dashboard') }}" class="button">
            Accéder à mon espace intervenant
        </a>
    </p>
    
    <p>Nous vous souhaitons beaucoup de succès sur VIMAIZ !</p>
    
    <p>L'équipe VIMAIZ</p>
@endsection
