@extends('emails.layout')

@section('title', 'Compte suspendu')

@section('content')
    <h1>Votre compte a été suspendu 🚫</h1>
    
    <p>Bonjour {{ $notifiable->name }},</p>
    
    <p>Nous vous informons que votre compte agent VIMAIZ a été temporairement suspendu.</p>
    
    <div class="warning-box" style="background-color: #fef2f2; border-left-color: #ef4444;">
        <p style="color: #991b1b;"><strong>Raison de la suspension :</strong></p>
        <p style="margin-top: 10px; color: #991b1b;">{{ $reason }}</p>
    </div>
    
    <div class="info-box">
        <p><strong>Durée de la suspension :</strong></p>
        <p style="margin-top: 10px;">
            Du <strong>{{ now()->format('d/m/Y') }}</strong> au <strong>{{ $suspendedUntil->format('d/m/Y') }}</strong>
        </p>
        <p style="margin-top: 10px; font-size: 13px;">
            Soit {{ now()->diffInDays($suspendedUntil) }} jour(s)
        </p>
    </div>
    
    <h2 style="margin-top: 30px;">Conséquences de la suspension</h2>
    
    <p>Pendant la durée de la suspension :</p>
    <ul style="margin: 20px 0; padding-left: 20px;">
        <li>❌ Vous ne recevrez plus de nouvelles missions</li>
        <li>❌ Vous ne pourrez pas accepter de missions</li>
        <li>✅ Vos gains accumulés restent disponibles</li>
        <li>✅ Vous pourrez toujours demander un retrait</li>
    </ul>
    
    <h2 style="margin-top: 30px;">Que faire ?</h2>
    
    <p>Si vous pensez que cette suspension est injustifiée, vous pouvez faire appel en nous contactant à <a href="mailto:contact@vimaiz.com">contact@vimaiz.com</a>.</p>
    
    <p>Votre compte sera automatiquement réactivé le <strong>{{ $suspendedUntil->format('d/m/Y à H:i') }}</strong>.</p>
    
    <p>L'équipe VIMAIZ</p>
@endsection
