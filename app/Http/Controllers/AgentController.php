<?php

namespace App\Http\Controllers;

use App\Models\AgentProfile;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentController extends Controller
{
    // public function index(Request $request)
    // {
    //     // Moved to SearchController
    // }

    public function show($id)
    {
        $agent = AgentProfile::with([
            'user',
            'services',
            'reviews' => function ($q) {
                $q->with('client')->latest()->limit(5);
            }
        ])->findOrFail($id);

        // Get agent's availabilities for the next 30 days
        $availabilities = \App\Models\Availability::where('agent_id', $agent->user_id)
            ->where(function ($query) {
                $query->whereNotNull('day_of_week')
                    ->orWhere('specific_date', '>=', now()->toDateString());
            })
            ->where('is_available', true)
            ->get()
            ->groupBy(function ($item) {
                if ($item->specific_date) {
                    return $item->specific_date;
                }
                // Calculate next occurrence of this day_of_week
                $today = now();
                $daysUntil = ($item->day_of_week - $today->dayOfWeek + 7) % 7;
                return $today->copy()->addDays($daysUntil)->toDateString();
            })
            ->map(function ($slots, $date) {
                return [
                    'date' => $date,
                    'day_of_week' => \Carbon\Carbon::parse($date)->dayOfWeek,
                    'slots' => $slots->map(function ($slot) {
                        return [
                            'start_time' => $slot->start_time,
                            'end_time' => $slot->end_time,
                            'is_available' => $slot->is_available,
                        ];
                    })->toArray(),
                ];
            })
            ->values();

        return Inertia::render('Agents/Show', [
            'agent' => $agent,
            'availabilities' => $availabilities,
        ]);
    }
}
