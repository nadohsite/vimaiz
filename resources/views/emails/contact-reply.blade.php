@extends('emails.layout')

@section('title', 'Réponse à votre message')

@section('content')
    <h1>Réponse à votre message</h1>

    <p>Bonjour {{ $contactMessage->name }},</p>

    <p>Merci de nous avoir contacté. Voici notre réponse à votre message :</p>

    <div class="info-box">
        <p>{!! nl2br(e($replyMessage)) !!}</p>
    </div>

    <p><strong>Votre message original :</strong></p>
    <div class="info-box">
        <p><strong>Sujet :</strong> {{ $contactMessage->subject }}</p>
        <p>{{ $contactMessage->message }}</p>
    </div>

    <p style="text-align: center;">
        <a href="{{ config('app.url') }}" class="button">
            Visiter notre site
        </a>
    </p>

    <p>Cordialement,<br>L'équipe VIMAIZ</p>
@endsection
