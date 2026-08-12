@extends('emails.layout')

@section('title', 'Nouvelle demande')

@section('content')
    <h1>Nouvelle demande d'intervention ! 🏠</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Une nouvelle demande d'intervention a été soumise.</p>

    <div class="success-box">
        <p><strong>Numéro de demande :</strong> {{ $request->request_number }}</p>
        <p><strong>Client :</strong> {{ $request->user->name ?? '—' }}</p>
        <p><strong>Date souhaitée :</strong> {{ optional($request->preferred_date)->format('d/m/Y') ?? 'Flexible' }}</p>
    </div>

    <div class="info-box">
        <p><strong>Type de bien :</strong> {{ $request->property->property_type ?? $request->property->type ?? 'N/A' }}</p>
        <p>Merci de traiter cette demande rapidement.</p>
    </div>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/admin/cleaning-requests/' . $request->id) }}" class="button">
            Voir la demande
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
