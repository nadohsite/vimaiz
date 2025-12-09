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

        // Search by Name or City
        if (!empty($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $query->whereHas('user', function (Builder $q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                  ->orWhereHas('addresses', function (Builder $addr) use ($searchTerm) {
                      $addr->where('city', 'like', $searchTerm);
                  });
            });
        }

        $agents = $query->get();

        // Calculate Distances and Filter by Radius
        if (!empty($filters['lat']) && !empty($filters['lng'])) {
            $lat = (float) $filters['lat'];
            $lng = (float) $filters['lng'];
            $radius = !empty($filters['radius']) ? (float) $filters['radius'] : 50;

            $agents = $agents->map(function ($agent) use ($lat, $lng) {
                $address = $agent->user->addresses->first();
                if (!$address || !$address->latitude || !$address->longitude) {
                    $agent->distance = null;
                    return $agent;
                }

                $agent->distance = $this->calculateDistance(
                    $lat,
                    $lng,
                    $address->latitude,
                    $address->longitude
                );
                return $agent;
            })->filter(function ($agent) use ($radius) {
                return $agent->distance !== null && $agent->distance <= $radius;
            });
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'distance';
        $sortDirection = $filters['sort_direction'] ?? 'asc';

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
            case 'experience':
                return $descending ? $agents->sortByDesc('experience_years') : $agents->sortBy('experience_years');
            case 'distance':
            default:
                // Put agents with no distance at the end
                return $agents->sortBy(function ($agent) {
                    return $agent->distance === null ? 999999 : $agent->distance;
                });
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
