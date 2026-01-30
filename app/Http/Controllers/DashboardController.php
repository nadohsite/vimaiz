<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Property;
use App\Models\ServiceRequest;
use App\Models\Mission;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Redirection basée sur le rôle
        if ($user->role === 'agent') {
            return redirect()->route('agent.dashboard');
        }

        if ($user->role === 'admin') {
            return redirect('/admin');
        }

        // Client Dashboard Data - selon VIMAIZ cahier des charges
        $properties = Property::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $activeRequests = ServiceRequest::where('client_id', $user->id)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->with(['property', 'quote'])
            ->orderBy('created_at', 'desc')
            ->get();

        $completedMissions = Mission::whereHas('serviceRequest', function ($q) use ($user) {
            $q->where('client_id', $user->id);
        })->where('status', 'completed');
        
        $completedCount = $completedMissions->count();
        $totalSpent = (clone $completedMissions)->sum('total_price');

        $upcomingMissions = Mission::whereHas('serviceRequest', function ($q) use ($user) {
            $q->where('client_id', $user->id);
        })->whereIn('status', ['pending_agent', 'agent_accepted'])
            ->with(['property', 'agent'])
            ->orderBy('scheduled_at')
            ->take(3)
            ->get();

        $recentMissions = Mission::whereHas('serviceRequest', function ($q) use ($user) {
            $q->where('client_id', $user->id);
        })->where('status', 'completed')
            ->with(['property', 'agent'])
            ->orderBy('completed_at', 'desc')
            ->take(3)
            ->get();

        return Inertia::render('Dashboard/Client', [
            'properties' => $properties,
            'activeRequests' => $activeRequests,
            'upcomingMissions' => $upcomingMissions,
            'recentMissions' => $recentMissions,
            'stats' => [
                'properties_count' => $properties->count(),
                'requests_count' => $activeRequests->count(),
                'completed_count' => $completedCount,
                'total_spent' => $totalSpent,
            ],
        ]);
    }

    public function agentDashboard()
    {
        $user = Auth::user();

        $pendingMissions = Mission::where('agent_id', $user->id)
            ->where('status', 'pending_agent')
            ->with(['serviceRequest.property', 'serviceRequest.client'])
            ->orderBy('scheduled_at')
            ->get();

        $activeMissions = Mission::where('agent_id', $user->id)
            ->whereIn('status', ['agent_accepted', 'in_progress'])
            ->with(['serviceRequest.property', 'serviceRequest.client'])
            ->orderBy('scheduled_at')
            ->get();

        $completedCount = Mission::where('agent_id', $user->id)
            ->where('status', 'completed')
            ->count();

        $totalEarned = Mission::where('agent_id', $user->id)
            ->where('status', 'completed')
            ->where('payment_status', 'paid')
            ->sum('agent_payout');

        return Inertia::render('Dashboard/Agent', [
            'pendingMissions' => $pendingMissions,
            'activeMissions' => $activeMissions,
            'stats' => [
                'pending_count' => $pendingMissions->count(),
                'active_count' => $activeMissions->count(),
                'completed_count' => $completedCount,
                'total_earned' => $totalEarned,
            ],
            'rcpClauseAccepted' => $user->agentProfile?->rcp_clause_accepted ?? false,
        ]);
    }
}
