@extends('emails.layout')

@section('title', 'Intervention terminée')

@section('content')
    <h1>Intervention terminée ! 🎉</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>Une intervention a été terminée avec succès par l'intervenant.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Intervenant :</strong> {{ $mission->agent->name ?? 'N/A' }}</p>
        <p><strong>Date de fin :</strong> {{ ($mission->completed_at ?? now())->format('d/m/Y à H:i') }}</p>
    </div>

    @php
        $durationLabel = $mission->actual_duration_label
            ?? \App\Support\DurationFormatter::minutes(
                $mission->started_at && $mission->completed_at
                    ? (int) $mission->started_at->diffInMinutes($mission->completed_at)
                    : null
            );
        $progress = $mission->checklistProgress();
        $anomalies = $mission->relationLoaded('anomalies') ? $mission->anomalies : collect();
    @endphp

    <div class="info-box">
        <p><strong>Client :</strong> {{ $mission->client->name ?? 'N/A' }}</p>
        <p><strong>Durée de l'intervention :</strong> {{ $durationLabel }}</p>
        @if($mission->estimated_duration_label)
            <p><strong>Durée estimée :</strong> {{ $mission->estimated_duration_label }}</p>
        @endif
        @if($progress['total'] > 0)
            <p><strong>Checklist :</strong> {{ $progress['checked'] }}/{{ $progress['total'] }}</p>
        @endif
        @if($mission->report_nothing_to_report || $anomalies->isEmpty())
            <p><strong>Rapport :</strong> Aucune anomalie signalée</p>
        @else
            <p><strong>Rapport :</strong> {{ $anomalies->count() }} anomalie{{ $anomalies->count() > 1 ? 's' : '' }}</p>
            @foreach($anomalies as $anomaly)
                <p>— {{ $anomaly->category_label }} : {{ $anomaly->label }}</p>
            @endforeach
        @endif
        <p><strong>Montant total :</strong> {{ number_format($mission->total_price, 2, ',', ' ') }} €</p>
        <p><strong>Commission VIMAIZ :</strong> {{ number_format($mission->platform_fee, 2, ',', ' ') }} €</p>
        <p><strong>Paiement intervenant :</strong> {{ number_format($mission->agent_payout, 2, ',', ' ') }} €</p>
    </div>

    <p>Le paiement intervenant a été crédité sur son portefeuille. Le client peut maintenant laisser un avis.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ config('app.url') }}/admin/missions/{{ $mission->id }}" class="button">
            Voir l'intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
