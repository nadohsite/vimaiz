<?php

namespace App\Support;

use App\Models\Mission;

/**
 * Règles d'affichage des brigades (cahier des charges « grands espaces »,
 * décision du 14/10/2026) : 125 m² maximum par intervenant, au moins
 * 2 intervenants dès 200 m², 1 seul intervenant sous 200 m² (biens existants).
 * Même formule que MissionService::requiredAgentsForProperty().
 */
class Brigade
{
    public const MAX_M2_PER_AGENT = 125;

    public static function sizeForSurface(float|int|null $surface): int
    {
        $surface = (float) $surface;

        if ($surface < 200) {
            return 1;
        }

        return max(2, (int) ceil($surface / self::MAX_M2_PER_AGENT));
    }

    public static function size(Mission $mission): int
    {
        return max(1, (int) ($mission->required_agents ?: self::sizeForSurface($mission->property?->surface_area)));
    }

    /**
     * Part d'un intervenant : montant définitif s'il est déjà fixé (clôture),
     * sinon estimation = pool / nombre d'intervenants prévus.
     */
    public static function shareFor(Mission $mission, ?int $agentId = null): float
    {
        if ($agentId) {
            $share = $mission->missionAgents()
                ->where('agent_id', $agentId)
                ->whereNotNull('payout_share')
                ->value('payout_share');

            if ($share !== null) {
                return (float) $share;
            }
        }

        return round((float) $mission->agent_payout / self::size($mission), 2);
    }

    /** « 3 intervenants certifiés » / « 1 intervenant certifié » */
    public static function label(int $size): string
    {
        return $size > 1 ? $size.' intervenants certifiés' : '1 intervenant certifié';
    }
}
