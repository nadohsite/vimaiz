<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $agentProfile = $user->agentProfile;

        // Wallet
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'pending_balance' => 0, 'total_earned' => 0, 'total_withdrawn' => 0]
        );

        // Stats VIMAIZ
        $stats = [
            'total_earnings' => $wallet->total_earned,
            'pending_earnings' => $wallet->pending_balance,
            'available_balance' => $wallet->balance,
            'missions_completed' => $agentProfile->missions_completed ?? 0,
            'missions_pending' => Mission::where('agent_id', $user->id)
                ->whereIn('status', [Mission::STATUS_PENDING_AGENT, Mission::STATUS_AGENT_ACCEPTED])
                ->count(),
            'missions_in_progress' => Mission::where('agent_id', $user->id)
                ->where('status', Mission::STATUS_IN_PROGRESS)
                ->count(),
            'internal_rating' => $agentProfile->internal_rating ?? 5.0,
            'is_eligible' => $agentProfile?->isEligibleForMissions() ?? false,
        ];

        // Missions en attente de réponse
        $pendingMissions = Mission::where('agent_id', $user->id)
            ->where('status', Mission::STATUS_PENDING_AGENT)
            ->with(['property', 'client'])
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get();

        // Missions à venir (acceptées)
        $upcomingMissions = Mission::where('agent_id', $user->id)
            ->where('status', Mission::STATUS_AGENT_ACCEPTED)
            ->where('scheduled_at', '>=', now())
            ->with(['property', 'client'])
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get();

        // Missions récentes (terminées)
        $recentMissions = Mission::where('agent_id', $user->id)
            ->where('status', Mission::STATUS_COMPLETED)
            ->with(['property', 'client'])
            ->orderByDesc('completed_at')
            ->limit(5)
            ->get();

        return Inertia::render('Agent/Dashboard', [
            'stats' => $stats,
            'pendingMissions' => $pendingMissions,
            'upcomingMissions' => $upcomingMissions,
            'recentMissions' => $recentMissions,
            'agentProfile' => $agentProfile,
            'rcpClauseAccepted' => $agentProfile?->rcp_clause_accepted ?? false,
        ]);
    }
}
