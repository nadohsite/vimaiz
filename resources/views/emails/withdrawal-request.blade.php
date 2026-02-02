@extends('emails.layout')

@section('title', 'Nouvelle demande de retrait')

@section('content')
    <h1>🏦 Nouvelle demande de retrait</h1>
    
    <p>Un agent a soumis une nouvelle demande de retrait qui nécessite votre validation.</p>

    <div class="info-box">
        <p><strong>Agent :</strong> {{ $agent->name }}</p>
        <p><strong>Email :</strong> {{ $agent->email }}</p>
        <p><strong>Montant demandé :</strong> {{ number_format($transaction->amount, 2, ',', ' ') }} €</p>
        <p><strong>Compte bancaire :</strong> {{ $bankAccount }}</p>
        <p><strong>Date de demande :</strong> {{ $transaction->created_at->format('d/m/Y à H:i') }}</p>
    </div>

    <p style="text-align: center;">
        <a href="{{ config('app.url') }}/admin/withdrawal-requests/{{ $transaction->id }}" class="button">
            Traiter la demande
        </a>
    </p>

    <p style="font-size: 13px; color: #64748b; margin-top: 30px;">
        Vous pouvez valider ou rejeter cette demande depuis le panneau d'administration.
    </p>
@endsection
