<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Booking;
use App\Models\Wallet;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get or create wallet
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'pending_balance' => 0, 'total_earned' => 0, 'total_withdrawn' => 0]
        );
        
        // Get agent profile
        $agentProfile = $user->agentProfile;
        
        // Calculate stats
        $stats = [
            'total_earnings' => $wallet->total_earned,
            'pending_earnings' => $wallet->pending_balance,
            'completed_jobs' => Booking::where('agent_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'pending_jobs' => Booking::where('agent_id', $user->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->count(),
            'average_rating' => $agentProfile->average_rating ?? 0,
            'total_reviews' => $agentProfile->total_reviews ?? 0,
        ];
        
        // Get upcoming bookings
        $upcoming_bookings = Booking::where('agent_id', $user->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('scheduled_at', '>=', now())
            ->with(['client', 'service'])
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get();
        
        // Get recent bookings
        $recent_bookings = Booking::where('agent_id', $user->id)
            ->with(['client', 'service'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        return Inertia::render('Agent/Dashboard', [
            'stats' => $stats,
            'upcoming_bookings' => $upcoming_bookings,
            'recent_bookings' => $recent_bookings,
        ]);
    }
}
