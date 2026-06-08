<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\MissionInvitation;
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

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'pending_balance' => 0, 'total_earned' => 0, 'total_withdrawn' => 0]
        );

        $proposedCount = MissionInvitation::where('agent_id', $user->id)
            ->where('status', MissionInvitation::STATUS_PENDING)
            ->count();

        $acceptedCount = Mission::where('agent_id', $user->id)
            ->where('status', Mission::STATUS_AGENT_ACCEPTED)
            ->count();

        $stats = [
            'total_earnings' => $wallet->total_earned,
            'pending_earnings' => $wallet->pending_balance,
            'available_balance' => $wallet->balance,
            'missions_completed' => $agentProfile->missions_completed ?? 0,
            'missions_pending' => $proposedCount + $acceptedCount,
            'missions_in_progress' => Mission::where('agent_id', $user->id)
                ->where('status', Mission::STATUS_IN_PROGRESS)
                ->count(),
            'internal_rating' => $agentProfile->internal_rating ?? 5.0,
            'is_eligible' => $agentProfile?->isEligibleForMissions() ?? false,
        ];

        $pendingMissions = Mission::query()
            ->where(function ($q) use ($user) {
                $q->whereHas('invitations', function ($iq) use ($user) {
                    $iq->where('agent_id', $user->id)
                        ->where('status', MissionInvitation::STATUS_PENDING);
                });
            })
            ->where('status', Mission::STATUS_PENDING_AGENT)
            ->whereNull('agent_id')
            ->with(['property', 'client'])
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get();

        $upcomingMissions = Mission::where('agent_id', $user->id)
            ->where('status', Mission::STATUS_AGENT_ACCEPTED)
            ->where('scheduled_at', '>=', now())
            ->with(['property', 'client'])
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get();

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
            'profileCompletionSteps' => $agentProfile?->getProfileCompletionSteps() ?? [],
        ]);
    }
}
