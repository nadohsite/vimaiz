@extends('emails.layout')

@section('title', 'Nouvelle demande de retrait')

@section('content')
    @php
        $paymentMethod = $transaction->metadata['payment_method'] ?? 'bank_transfer';
        $isMobileMoney = $paymentMethod === 'mobile_money';
    @endphp

    <h1>Nouvelle demande de retrait ! {{ $isMobileMoney ? '📱' : '🏦' }}</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Un intervenant a soumis une nouvelle demande de retrait qui nécessite votre validation.</p>

    <div class="success-box">
        <p><strong>Intervenant :</strong> {{ $agent->name }}</p>
        <p><strong>Montant demandé :</strong> {{ number_format($transaction->amount, 2, ',', ' ') }} €</p>
        <p><strong>Mode de paiement :</strong> {{ $isMobileMoney ? 'Mobile Money' : 'Virement bancaire' }}</p>
        <p><strong>Date de demande :</strong> {{ ($transaction->created_at ?? now())->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="info-box">
        <p><strong>Email :</strong> {{ $agent->email }}</p>
        @if ($isMobileMoney)
            <p><strong>Titulaire :</strong> {{ $transaction->metadata['account_name'] ?? 'Non renseigné' }}</p>
            <p><strong>Fournisseur :</strong> {{ $transaction->metadata['provider_label'] ?? 'Non renseigné' }}</p>
            <p><strong>Numéro :</strong> {{ $transaction->metadata['phone'] ?? $bankAccount }}</p>
        @else
            <p><strong>Titulaire :</strong> {{ $transaction->metadata['bank_account_holder'] ?? 'Non renseigné' }}</p>
            <p><strong>IBAN :</strong> {{ \App\Models\AgentProfile::formatIban($bankAccount) ?? $bankAccount }}</p>
            @if (!empty($transaction->metadata['bic']))
                <p><strong>BIC :</strong> {{ $transaction->metadata['bic'] }}</p>
            @endif
        @endif
        <p>Vous pouvez valider ou rejeter cette demande depuis le panneau d'administration.</p>
    </div>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ config('app.url') }}/admin/withdrawal-requests/{{ $transaction->id }}" class="button">
            Traiter la demande
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
