<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Wallet;

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
            'amount' => 'required|numeric|min:100',
            'bank_account' => 'required|string',
        ]);
        
        $wallet = $request->user()->wallet;
        
        if (!$wallet || $wallet->balance < $validated['amount']) {
            return redirect()->back()->withErrors(['amount' => 'Insufficient balance']);
        }
        
        try {
            $wallet->withdraw($validated['amount'], $validated['bank_account']);
            
            return redirect()->back()->with('success', 'Withdrawal request submitted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['amount' => $e->getMessage()]);
        }
    }
}
