<?php

namespace App\Services;

use App\Models\Mission;
use App\Models\User;
use App\Support\Geo;
use Illuminate\Support\Collection;

class GeographicMatchingService
{
    public const ZONE_STANDARD = 'standard';

    public const ZONE_EXTENDED = 'extended';

    public function standardRadiusKm(): float
    {
        return (float) config('vimaiz.matching.standard_radius_km', 30);
    }

    public function extendedRadiusKm(): float
    {
        return (float) config('vimaiz.matching.extended_radius_km', 150);
    }

    public function extendedMinPayoutPerKm(): float
    {
        return (float) config('vimaiz.matching.extended_min_payout_per_km', 2.5);
    }

    /**
     * @return array{eligible: bool, zone: ?string, distance_km: ?float, payout_per_km: ?float}
     */
    public function evaluate(float $distanceKm, float $agentPayout): array
    {
        $payoutPerKm = $distanceKm > 0 ? round($agentPayout / $distanceKm, 2) : null;

        if ($distanceKm <= $this->standardRadiusKm()) {
            return [
                'eligible' => true,
                'zone' => self::ZONE_STANDARD,
                'distance_km' => round($distanceKm, 1),
                'payout_per_km' => $payoutPerKm,
            ];
        }

        if ($distanceKm <= $this->extendedRadiusKm()
            && $payoutPerKm !== null
            && $payoutPerKm >= $this->extendedMinPayoutPerKm()) {
            return [
                'eligible' => true,
                'zone' => self::ZONE_EXTENDED,
                'distance_km' => round($distanceKm, 1),
                'payout_per_km' => $payoutPerKm,
            ];
        }

        return [
            'eligible' => false,
            'zone' => null,
            'distance_km' => round($distanceKm, 1),
            'payout_per_km' => $payoutPerKm,
        ];
    }

    public function isGeographicallyEligible(User $agent, Mission $mission): bool
    {
        $result = $this->evaluateForAgent($agent, $mission);

        return (bool) ($result['eligible'] ?? false);
    }

    /**
     * @return array{eligible: bool, zone: ?string, distance_km: ?float, payout_per_km: ?float}
     */
    public function evaluateForAgent(User $agent, Mission $mission): array
    {
        $from = $agent->referenceCoordinates();
        $property = $mission->property;

        if (! $from || ! $property?->latitude || ! $property?->longitude) {
            return [
                'eligible' => false,
                'zone' => null,
                'distance_km' => null,
                'payout_per_km' => null,
            ];
        }

        $distanceKm = Geo::distanceKm(
            $from['latitude'],
            $from['longitude'],
            (float) $property->latitude,
            (float) $property->longitude,
        );

        return $this->evaluate($distanceKm, (float) $mission->agent_payout);
    }

    /**
     * Missions ouvertes que cet intervenant a le droit de voir (filtre serveur).
     *
     * @return list<int>
     */
    public function visibleOpenMissionIdsFor(User $agent): array
    {
        if (! $agent->referenceCoordinates()) {
            return [];
        }

        if ($this->hasPendingMission($agent)) {
            return [];
        }

        return $this->openPaidMissions()
            ->filter(fn (Mission $mission) => $this->isGeographicallyEligible($agent, $mission))
            ->pluck('id')
            ->all();
    }

    public function hasPendingMission(User $agent): bool
    {
        return Mission::query()
            ->where('agent_id', $agent->id)
            ->where('status', Mission::STATUS_PENDING_AGENT)
            ->exists();
    }

    /**
     * @return Collection<int, Mission>
     */
    protected function openPaidMissions(): Collection
    {
        return Mission::query()
            ->whereNull('agent_id')
            ->where('status', Mission::STATUS_PENDING_AGENT)
            ->where('payment_status', Mission::PAYMENT_PAID)
            ->with('property')
            ->get();
    }
}
