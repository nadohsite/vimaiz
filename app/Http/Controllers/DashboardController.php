<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Booking;
use App\Models\Property;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->hasRole('agent')) {
            return redirect()->route('agent.dashboard');
        }

        if ($user->hasRole('admin')) {
            // return Inertia::render('Dashboard/Admin'); // Not implemented yet
            return Inertia::render('dashboard'); // Fallback for now or Admin specific
        }

        // Client Dashboard Data
        $activeBookings = Booking::where('client_id', $user->id)
            ->whereIn('status', ['pending', 'accepted', 'in_progress'])
            ->with(['agent.profile', 'service'])
            ->orderBy('scheduled_at')
            ->take(3)
            ->get();

        $properties = Property::where('user_id', $user->id)
            ->take(4)
            ->get();

        return Inertia::render('Dashboard/Client', [
            'activeBookings' => $activeBookings,
            'properties' => $properties,
        ]);
    }

    public function agentDashboard()
    {
        $user = Auth::user();

        return Inertia::render('Dashboard/Agent', [
            'stats' => [
                'active_bookings' => Booking::where('agent_id', $user->id)->where('status', 'accepted')->count(),
                'pending_requests' => Booking::where('agent_id', $user->id)->where('status', 'pending')->count(),
            ]
        ]);
    }
}
