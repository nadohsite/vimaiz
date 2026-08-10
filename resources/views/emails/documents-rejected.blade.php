@extends('emails.layout')

@section('title', 'Documents rejetés')

@section('content')
    <h1>Action requise : Documents rejetés</h1>
    
    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>
    
    <p>Nous avons examiné les documents que vous avez soumis, mais nous ne pouvons malheureusement pas les valider en l'état.</p>
    
    <div class="warning-box">
        <p><strong>⚠️ Raison du rejet :</strong></p>
        <p style="margin-top: 10px;">{{ $reason }}</p>
    </div>
    
    <h2 style="margin-top: 30px;">Que faire maintenant ?</h2>
    
    <ol style="margin: 20px 0; padding-left: 20px;">
        <li>Connectez-vous à votre espace intervenant</li>
        <li>Accédez à la section "Mes documents"</li>
        <li>Téléchargez les documents corrigés</li>
        <li>Soumettez à nouveau pour vérification</li>
    </ol>
    
    <p style="text-align: center;">
        <a href="{{ url('/agent/documents') }}" class="button">
            Corriger mes documents
        </a>
    </p>
    
    <div class="info-box">
        <p><strong>💡 Conseils :</strong></p>
        <p>- Assurez-vous que les documents sont lisibles et non flous</p>
        <p>- Vérifiez que toutes les informations sont visibles</p>
        <p>- Les documents doivent être en cours de validité</p>
    </div>
    
    <p>Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:contact@vimaiz.com">contact@vimaiz.com</a>.</p>
    
    <p>L'équipe VIMAIZ</p>
@endsection
