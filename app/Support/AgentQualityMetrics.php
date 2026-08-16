<?php

namespace App\Support;

use App\Models\AgentProfile;
use App\Models\Mission;
use App\Models\MissionAnomaly;
use App\Models\Review;

class AgentQualityMetrics
{
    /** @var array<int, array<string, mixed>> */
    private static array $cache = [];

    public static function for(AgentProfile $profile): array
    {
        return self::$cache[$profile->id] ??= self::compute($profile);
    }

    private static function compute(AgentProfile $profile): array
    {
        $agentId = $profile->user_id;

        $completed = Mission::query()
            ->where('agent_id', $agentId)
            ->where('status', Mission::STATUS_COMPLETED);

        $completedCount = (clone $completed)->count();
        $withReport = (clone $completed)->whereNotNull('report_submitted_at')->count();
        $nothingToReport = (clone $completed)->where('report_nothing_to_report', true)->count();
        $withAnomalies = (clone $completed)->where('report_nothing_to_report', false)->count();
        $anomalyCount = MissionAnomaly::query()->where('agent_id', $agentId)->count();
        $avgActualMinutes = (clone $completed)->whereNotNull('actual_duration_minutes')->avg('actual_duration_minutes');
        $avgEstimatedHours = (clone $completed)->avg('duration_hours');

        $cancelled = Mission::query()
            ->where('agent_id', $agentId)
            ->where('status', Mission::STATUS_CANCELLED)
            ->count();

        $checklistChecked = 0;
        $checklistTotal = 0;
        foreach ((clone $completed)->get(['checklist']) as $mission) {
            $progress = $mission->checklistProgress();
            $checklistChecked += $progress['checked'];
            $checklistTotal += $progress['total'];
        }

        $avgRating = Review::query()
            ->where('agent_id', $agentId)
            ->where('status', 'approved')
            ->avg('rating');

        $anomalyRate = $completedCount > 0 ? round($withAnomalies / $completedCount * 100) : null;
        $checklistRate = $checklistTotal > 0 ? round($checklistChecked / $checklistTotal * 100) : null;
        $cancelRate = ($completedCount + $cancelled) > 0
            ? round($cancelled / ($completedCount + $cancelled) * 100)
            : null;

        return [
            'missions_completed' => $completedCount,
            'missions_cancelled' => $cancelled,
            'missions_refused' => (int) $profile->missions_refused,
            'reports_submitted' => $withReport,
            'nothing_to_report' => $nothingToReport,
            'missions_with_anomalies' => $withAnomalies,
            'anomalies_count' => $anomalyCount,
            'anomaly_rate' => $anomalyRate,
            'checklist_completion_rate' => $checklistRate,
            'average_actual_duration_label' => DurationFormatter::minutes(
                $avgActualMinutes !== null ? (int) round((float) $avgActualMinutes) : null
            ),
            'average_estimated_duration_label' => DurationFormatter::hours(
                $avgEstimatedHours !== null ? (float) $avgEstimatedHours : null
            ),
            'average_rating' => $avgRating !== null ? round((float) $avgRating, 1) : null,
            'reliability_label' => self::reliabilityLabel(
                $completedCount,
                $avgRating !== null ? (float) $avgRating : null,
                $anomalyRate,
                $cancelRate
            ),
        ];
    }

    private static function reliabilityLabel(
        int $completedCount,
        ?float $avgRating,
        ?int $anomalyRate,
        ?int $cancelRate
    ): string {
        if ($completedCount < 5) {
            return 'historique insuffisant';
        }

        $ratingOk = $avgRating === null || $avgRating >= 4.4;
        $anomaliesOk = $anomalyRate === null || $anomalyRate <= 35;
        $cancelsOk = $cancelRate === null || $cancelRate <= 10;

        if ($ratingOk && $anomaliesOk && $cancelsOk) {
            return 'fiable';
        }

        if (($avgRating !== null && $avgRating < 3.5) || ($cancelRate !== null && $cancelRate > 25)) {
            return 'vigilance';
        }

        return 'correct';
    }
}
