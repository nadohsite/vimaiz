@extends('emails.layout')

@section('title', 'Votre récap de la semaine')

@section('content')
    @php
        $isAgent = $role === 'agent';
        $completedCount = $completedMissions->count();
        $upcomingCount = $upcomingMissions->count();
        $total = $completedMissions->sum(fn ($m) => (float) ($m->amount ?? 0));
        $totalLabel = number_format($total, $total == floor($total) ? 0 : 2, ',', ' ').' €';

        $stats = [
            ['icon' => '✅', 'value' => $completedCount, 'label' => $completedCount > 1 ? 'Terminées' : 'Terminée'],
            ['icon' => '📅', 'value' => $upcomingCount, 'label' => 'À venir'],
            ['icon' => '💰', 'value' => $totalLabel, 'label' => $isAgent ? 'Gagné' : 'Investi'],
        ];

        $tip = $isAgent
            ? 'Astuce : tenez vos disponibilités et vos secteurs à jour pour recevoir plus de propositions dans de grandes résidences.'
            : 'Astuce : renseignez les consignes permanentes de votre logement, elles deviennent la feuille de route de chaque équipe.';
    @endphp

    <h1>Votre récap de la semaine</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }} !</p>

    {{-- Statistiques : trois tuiles (icône, chiffre, libellé) --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="width:100%;margin:22px 0 18px;background-color:#f4f6f9;border:1px solid #e2e8f0;border-radius:14px;border-collapse:separate;">
        <tr>
            <td style="padding:20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                       style="width:100%;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;border-collapse:separate;">
                    <tr>
                        @foreach ($stats as $stat)
                            <td class="stat-cell" align="center" valign="top" width="33%"
                                style="width:33%;padding:18px 6px;text-align:center;">
                                <div style="font-size:22px;line-height:1;margin:0 0 8px;">{{ $stat['icon'] }}</div>
                                <div class="stat-value" style="font-size:26px;line-height:1.1;font-weight:800;color:#0b1420;margin:0 0 6px;white-space:nowrap;">{{ $stat['value'] }}</div>
                                <div style="font-size:13px;line-height:1.3;color:#64748b;">{{ $stat['label'] }}</div>
                            </td>
                        @endforeach
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <p style="font-size:13px !important;color:#64748b !important;text-align:center !important;margin:0 0 16px;">
        Semaine du {{ $weekLabel }}
    </p>

    @if ($completedMissions->isNotEmpty())
        <div class="info-box">
            <p><strong>Terminées la semaine dernière</strong></p>
            @foreach ($completedMissions as $mission)
                <p>
                    • {{ $mission->property_label }}
                    @if (!empty($mission->completed_at_label))
                        ({{ $mission->completed_at_label }})
                    @endif
                    @if (isset($mission->amount_label))
                        — {{ $mission->amount_label }}
                    @endif
                </p>
            @endforeach
        </div>
    @endif

    @if ($upcomingMissions->isNotEmpty())
        <div class="info-box">
            <p><strong>À venir cette semaine</strong></p>
            @foreach ($upcomingMissions as $mission)
                <p>
                    • {{ $mission->property_label }}
                    @if (!empty($mission->scheduled_at_label))
                        ({{ $mission->scheduled_at_label }})
                    @endif
                </p>
            @endforeach
        </div>
    @endif

    {{-- Astuce : liseré bleu à gauche --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="width:100%;margin:18px 0 6px;background-color:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #1594cc;border-radius:10px;border-collapse:separate;">
        <tr>
            <td style="padding:13px 16px;font-size:14px;line-height:1.5;color:#334155;">
                💡 {{ $tip }}
            </td>
        </tr>
    </table>

    <p class="cta" style="text-align:center !important; margin:24px 0;">
        <a href="{{ $isAgent ? url('/agent/dashboard') : url('/dashboard') }}" class="button"
           style="display:inline-block;padding:15px 44px;border-radius:999px;font-weight:700;">
            Voir mon espace
        </a>
    </p>
@endsection
