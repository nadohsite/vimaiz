<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgentProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AgentController extends Controller
{
    /**
     * Get list of agents with filters
     */
    public function index(Request $request)
    {
        $query = AgentProfile::with('user', 'services')
            ->verified()
            ->available();

        // Filter by service
        if ($request->has('service_id')) {
            $query->whereHas('services', function ($q) use ($request) {
                $q->where('services.id', $request->service_id);
            });
        }

        // Filter by location (nearby agents)
        if ($request->has('latitude') && $request->has('longitude')) {
            $lat = $request->latitude;
            $lng = $request->longitude;
            $radius = $request->radius ?? 15; // default 15km

            // Haversine formula for distance calculation
            $query->whereHas('user.addresses', function ($q) use ($lat, $lng, $radius) {
                $q->selectRaw("
                    ( 6371 * acos( cos( radians(?) ) *
                    cos( radians( latitude ) ) *
                    cos( radians( longitude ) - radians(?) ) +
                    sin( radians(?) ) *
                    sin( radians( latitude ) ) ) ) AS distance
                ", [$lat, $lng, $lat])
                ->having('distance', '<', $radius);
            });
        }

        // Filter by rating
        if ($request->has('min_rating')) {
            $query->where('average_rating', '>=', $request->min_rating);
        }

        // Filter by price range
        if ($request->has('max_price')) {
            $query->where('hourly_rate', '<=', $request->max_price);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'average_rating');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $agents = $query->paginate(12);

        return response()->json($agents);
    }

    /**
     * Get agent profile details
     */
    public function show($id)
    {
        $agent = AgentProfile::with([
            'user',
            'services',
            'reviews' => function ($query) {
                $query->approved()->latest()->limit(10);
            }
        ])->findOrFail($id);

        return response()->json($agent);
    }

    /**
     * Update agent profile (agent only)
     */
    public function update(Request $request)
    {
        $user = $request->user();

        if (!$user->isAgent()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'description' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0',
            'hourly_rate' => 'nullable|numeric|min:0',
            'service_radius_km' => 'nullable|integer|min:1|max:50',
            'is_available' => 'nullable|boolean',
        ]);

        $user->agentProfile->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'profile' => $user->agentProfile->fresh(),
        ]);
    }

    /**
     * Get agent's statistics
     */
    public function statistics(Request $request)
    {
        $user = $request->user();

        if (!$user->isAgent()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $profile = $user->agentProfile;

        $stats = [
            'total_bookings' => $profile->total_bookings,
            'average_rating' => $profile->average_rating,
            'total_reviews' => $profile->total_reviews,
            'total_earnings' => $user->transactions()
                ->where('type', 'payment')
                ->where('status', 'completed')
                ->sum('amount'),
            'pending_bookings' => $user->agentBookings()->pending()->count(),
            'upcoming_bookings' => $user->agentBookings()->upcoming()->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Search agents by location
     */
    public function searchNearby(Request $request)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius' => 'nullable|integer|min:1|max:50',
            'service_id' => 'nullable|exists:services,id',
        ]);

        $lat = $validated['latitude'];
        $lng = $validated['longitude'];
        $radius = $validated['radius'] ?? 15;

        $agents = AgentProfile::with('user', 'services')
            ->verified()
            ->available()
            ->select('agent_profiles.*')
            ->selectRaw("
                ( 6371 * acos( cos( radians(?) ) *
                cos( radians( COALESCE((SELECT latitude FROM addresses WHERE user_id = agent_profiles.user_id LIMIT 1), 0) ) ) *
                cos( radians( COALESCE((SELECT longitude FROM addresses WHERE user_id = agent_profiles.user_id LIMIT 1), 0) ) - radians(?) ) +
                sin( radians(?) ) *
                sin( radians( COALESCE((SELECT latitude FROM addresses WHERE user_id = agent_profiles.user_id LIMIT 1), 0) ) ) ) ) AS distance
            ", [$lat, $lng, $lat])
            ->having('distance', '<', $radius)
            ->orderBy('distance')
            ->get();

        return response()->json($agents);
    }
}
