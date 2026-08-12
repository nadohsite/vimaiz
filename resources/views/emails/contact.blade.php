@extends('emails.layout')

@section('title', 'Nouveau message de contact')

@section('content')
    <h1>Nouveau message de contact ! ✉️</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Un nouveau message a été envoyé depuis le formulaire de contact.</p>

    <div class="success-box">
        <p><strong>Nom :</strong> {{ $name }}</p>
        <p><strong>Email :</strong> <a href="mailto:{{ $email }}">{{ $email }}</a></p>
        <p><strong>Sujet :</strong> {{ $subject }}</p>
    </div>

    <div class="info-box">
        <p><strong>Message :</strong></p>
        <p>{!! nl2br(e($content)) !!}</p>
    </div>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
