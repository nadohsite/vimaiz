<?php

namespace App\Services;

use App\Models\AgentProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AgentMatchingService
{
    public function search(array $filters): Collection
    {
        $query = AgentProfile::query()
            ->with(['user.addresses', 'services', 'reviews'])
            ->verified()
            ->available();

        // Filter by Service
        if (!empty($filters['service_id'])) {
            $query->whereHas('services', function (Builder $q) use ($filters) {
                $q->where('services.id', $filters['service_id']);
            });
        }

        // Filter by Price Range
        if (!empty($filters['min_price'])) {
            $query->where('hourly_rate', '>=', $filters['min_price']);
        }
        if (!empty($filters['max_price'])) {
            $query->where('hourly_rate', '<=', $filters['max_price']);
        }

        // Filter by Rating
        if (!empty($filters['min_rating'])) {
            $query->where('average_rating', '>=', $filters['min_rating']);
        }

        // Filter by Experience
        if (!empty($filters['min_experience'])) {
            $query->where('experience_years', '>=', $filters['min_experience']);
        }

        // Filter by Property Type
        if (!empty($filters['property_type'])) {
            $query->whereJsonContains('supported_property_types', $filters['property_type']);
        }

        // Filter by Surface Area
        if (!empty($filters['size'])) {
            $maxSurface = match ($filters['size']) {
                'small' => 50,
                'medium' => 100,
                'large' => 200,
                'extra' => 999999,
                default => 0,
            };

            // On cherche des agents qui acceptent au moins cette surface
            if ($maxSurface > 0) {
                $query->where(function ($q) use ($maxSurface) {
                    $q->whereNull('max_surface_area')
                        ->orWhere('max_surface_area', '>=', $maxSurface);
                });
            }
        }

        // Search by Name or City
        if (!empty($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $query->whereHas('user', function (Builder $q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                    ->orWhereHas('addresses', function (Builder $addr) use ($searchTerm) {
                        $addr->where('city', 'like', $searchTerm)
                            ->orWhere('postal_code', 'like', $searchTerm);
                    });
            });
        }

        $agents = $query->get();

        // Calculate Distances and Weighted Scores
        $lat = !empty($filters['lat']) ? (float) $filters['lat'] : null;
        $lng = !empty($filters['lng']) ? (float) $filters['lng'] : null;
        $radius = !empty($filters['radius']) ? (float) $filters['radius'] : 50;

        $agents = $agents->map(function ($agent) use ($lat, $lng) {
            $address = $agent->user->addresses->first();

            // Distance calculation
            if ($lat && $lng && $address && $address->latitude && $address->longitude) {
                $agent->distance = $this->calculateDistance($lat, $lng, $address->latitude, $address->longitude);
            } else {
                $agent->distance = null;
            }

            // Weighted Ranking Score (higher is better)
            // Factor 1: Rating (0-5 scale, weight 40%)
            $ratingScore = ($agent->average_rating / 5) * 40;

            // Factor 2: Experience (cap at 10 years, weight 20%)
            $expScore = (min($agent->experience_years, 10) / 10) * 20;

            // Factor 3: Price competitiveness (lower is usually better, weight 20%)
            // Assuming average rate is around 100 MAD, score higher for lower rates
            $priceScore = max(0, (200 - $agent->hourly_rate) / 200) * 20;

            // Factor 4: Proximity (weight 20%)
            $distScore = 0;
            if ($agent->distance !== null) {
                $distScore = max(0, (50 - $agent->distance) / 50) * 20;
            }

            $agent->search_score = $ratingScore + $expScore + $priceScore + $distScore;

            return $agent;
        });

        // Apply distance filter if requested
        if ($lat && $lng && !empty($filters['radius'])) {
            $agents = $agents->filter(function ($agent) use ($radius) {
                return $agent->distance === null || $agent->distance <= $radius;
            });
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'score';
        $sortDirection = $filters['sort_direction'] ?? 'desc';

        return $this->sortAgents($agents, $sortBy, $sortDirection);
    }

    private function sortAgents(Collection $agents, string $sortBy, string $direction): Collection
    {
        $descending = $direction === 'desc';

        switch ($sortBy) {
            case 'price':
                return $descending ? $agents->sortByDesc('hourly_rate') : $agents->sortBy('hourly_rate');
            case 'rating':
                return $descending ? $agents->sortByDesc('average_rating') : $agents->sortBy('average_rating');
            case 'distance':
                return $agents->sortBy(function ($agent) {
                    return $agent->distance === null ? 999999 : $agent->distance;
                });
            case 'score':
            default:
                return $descending ? $agents->sortByDesc('search_score') : $agents->sortBy('search_score');
        }
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
