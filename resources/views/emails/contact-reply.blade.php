@extends('emails.layout')

@section('title', 'Réponse à votre message')

@section('content')
    <h1>Réponse à votre message ! 💬</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Merci de nous avoir contacté. Voici notre réponse à votre message.</p>

    <div class="success-box">
        <p><strong>Sujet :</strong> {{ $contactMessage->subject }}</p>
        <p><strong>Destinataire :</strong> {{ $contactMessage->name }}</p>
    </div>

    <div class="info-box">
        <p><strong>Notre réponse :</strong></p>
        <p>{!! nl2br(e($replyMessage)) !!}</p>
    </div>

    <div class="info-box">
        <p><strong>Votre message original :</strong></p>
        <p>{{ $contactMessage->message }}</p>
    </div>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ config('app.url') }}" class="button">
            Visiter notre site
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
