@extends('emails.layout')

@section('title', 'Intervention terminée')

@section('content')
    <h1>Intervention terminée ! 🎉</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>L'intervention sur votre bien est terminée. Il ne vous reste plus qu'à confirmer que tout est conforme.</p>

    <div class="success-box">
        <p><strong>Intervention :</strong> {{ $mission->mission_number }}</p>
        <p><strong>Fin :</strong> {{ ($mission->completed_at ?? now())->format('d/m/Y à H:i') }}</p>
    </div>

    @php
        $progress = $mission->checklistProgress();
        $durationLabel = $mission->actual_duration_label
            ?? \App\Support\DurationFormatter::minutes(
                $mission->started_at && $mission->completed_at
                    ? (int) $mission->started_at->diffInMinutes($mission->completed_at)
                    : null
            );
        $anomalies = $mission->relationLoaded('anomalies') ? $mission->anomalies : collect();
    @endphp

    <div class="info-box">
        <p><strong>Bien :</strong> {{ $mission->property->name ?? $mission->property->type }}</p>
        <p><strong>Début :</strong> {{ ($mission->started_at ?? null)?->format('d/m/Y à H:i') ?? '—' }}</p>
        <p><strong>Fin :</strong> {{ ($mission->completed_at ?? now())->format('d/m/Y à H:i') }}</p>
        <p><strong>Durée de l'intervention :</strong> {{ $durationLabel }}</p>
        @if($progress['total'] > 0)
            <p><strong>Checklist :</strong> {{ $progress['checked'] }}/{{ $progress['total'] }} tâches complétées</p>
        @endif
    </div>

    <div class="info-box">
        @if($mission->report_nothing_to_report || $anomalies->isEmpty())
            <p><strong>Rapport :</strong> Intervention terminée — aucune anomalie signalée.</p>
        @else
            <p><strong>Rapport :</strong> {{ $anomalies->count() }} élément{{ $anomalies->count() > 1 ? 's' : '' }} signalé{{ $anomalies->count() > 1 ? 's' : '' }}</p>
            @foreach($anomalies as $anomaly)
                <p>— {{ $anomaly->category_label }} : {{ $anomaly->label }}@if($anomaly->notes) ({{ $anomaly->notes }})@endif</p>
            @endforeach
        @endif
    </div>

    <p>L'intervention a été <strong>géolocalisée</strong> et <strong>horodatée</strong>. Retrouvez tous les détails dans votre espace client.</p>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ url('/client/missions/' . $mission->id) }}" class="button">
            Confirmer l'intervention
        </a>
    </p>

    <p>À bientôt,<br>L'équipe VIMAIZ</p>
@endsection
