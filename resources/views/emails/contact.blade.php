@extends('emails.layout')

@section('title', 'Nouveau message de contact')

@section('content')
    <h1>Nouveau message de contact</h1>

    <div class="info-box">
        <p><strong>Nom :</strong> {{ $name }}</p>
        <p><strong>Email :</strong> <a href="mailto:{{ $email }}">{{ $email }}</a></p>
        <p><strong>Sujet :</strong> {{ $subject }}</p>
    </div>

    <p><strong>Message :</strong></p>
    <div class="info-box">
        <p>{!! nl2br(e($content)) !!}</p>
    </div>
@endsection
