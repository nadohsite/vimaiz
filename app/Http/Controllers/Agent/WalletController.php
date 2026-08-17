<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use App\Notifications\WithdrawalRequestNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'pending_balance' => 0, 'total_earned' => 0, 'total_withdrawn' => 0]
        );

        $transactions = $wallet->transactions()
            ->with(['mission.property', 'booking'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Calculate real stats
        $stats = [
            'total_missions' => $user->agentMissions()->count(),
            'completed_missions' => $user->agentMissions()->where('status', 'completed')->count(),
            'pending_missions' => $user->agentMissions()->whereIn('status', ['pending_agent', 'agent_accepted', 'in_progress'])->count(),
            'this_month_earned' => $wallet->transactions()
                ->where('type', 'credit')
                ->where('status', 'completed')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount'),
        ];

        return Inertia::render('Agent/Wallet/Index', [
            'wallet' => $wallet,
            'transactions' => $transactions,
            'stats' => $stats,
        ]);
    }

    public function withdraw(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'bank_account' => 'required|string',
        ]);

        $wallet = $request->user()->wallet;

        if (! $wallet || $wallet->balance < $validated['amount']) {
            return redirect()->back()->withErrors(['amount' => 'Insufficient balance']);
        }

        try {
            $transaction = $wallet->withdraw($validated['amount'], $validated['bank_account']);

            // Notify all admins about the withdrawal request
            User::notifyAdmins(new WithdrawalRequestNotification($transaction, $request->user()));

            return redirect()->back()->with('success', 'Demande de retrait soumise avec succès !');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['amount' => $e->getMessage()]);
        }
    }
}
