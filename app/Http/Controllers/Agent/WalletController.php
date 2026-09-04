<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\UpdateBankDetailsRequest;
use App\Http\Requests\Agent\UpdateMobileMoneyDetailsRequest;
use App\Http\Requests\Agent\WithdrawRequest;
use App\Models\AgentProfile;
use App\Models\User;
use App\Models\Wallet;
use App\Notifications\WithdrawalRequestNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'pending_balance' => 0, 'total_earned' => 0, 'total_withdrawn' => 0]
        );

        $agentProfile = $user->agentProfile;

        $transactions = $wallet->transactions()
            ->with(['mission.property', 'booking'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

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
            'bankDetails' => $agentProfile
                ? $agentProfile->bankDetailsForWallet()
                : [
                    'iban' => null,
                    'bic' => null,
                    'bank_account_holder' => null,
                    'is_complete' => false,
                ],
            'mobileMoneyDetails' => $agentProfile
                ? $agentProfile->mobileMoneyDetailsForWallet()
                : [
                    'provider' => null,
                    'provider_label' => null,
                    'phone' => null,
                    'account_name' => null,
                    'is_complete' => false,
                ],
            'payoutMethods' => $agentProfile ? $agentProfile->payoutMethodsForWallet() : [],
            'mobileMoneyProviders' => AgentProfile::MOBILE_MONEY_PROVIDERS,
        ]);
    }

    public function updateBankDetails(UpdateBankDetailsRequest $request): RedirectResponse
    {
        $user = $request->user();

        $agentProfile = $user->agentProfile ?? AgentProfile::create([
            'user_id' => $user->id,
            'verification_status' => 'pending',
        ]);

        $agentProfile->update($request->validated());

        return redirect()->back()->with('success', 'Coordonnées bancaires enregistrées.');
    }

    public function updateMobileMoneyDetails(UpdateMobileMoneyDetailsRequest $request): RedirectResponse
    {
        $user = $request->user();

        $agentProfile = $user->agentProfile ?? AgentProfile::create([
            'user_id' => $user->id,
            'verification_status' => 'pending',
        ]);

        $agentProfile->update($request->validated());

        return redirect()->back()->with('success', 'Coordonnées Mobile Money enregistrées.');
    }

    public function withdraw(WithdrawRequest $request): RedirectResponse
    {
        $user = $request->user();
        $agentProfile = $user->agentProfile;
        $paymentMethod = $request->validated('payment_method');

        if (! $agentProfile || ! $agentProfile->hasPayoutMethod()) {
            return redirect()->back()->withErrors([
                'payment_method' => 'Enregistrez un mode de paiement avant de demander un retrait.',
            ]);
        }

        if ($paymentMethod === AgentProfile::PAYOUT_BANK_TRANSFER && ! $agentProfile->hasBankDetails()) {
            return redirect()->back()->withErrors([
                'payment_method' => 'Renseignez votre IBAN avant de demander un retrait bancaire.',
            ]);
        }

        if ($paymentMethod === AgentProfile::PAYOUT_MOBILE_MONEY && ! $agentProfile->hasMobileMoneyDetails()) {
            return redirect()->back()->withErrors([
                'payment_method' => 'Renseignez votre Mobile Money avant de demander un retrait.',
            ]);
        }

        $wallet = $user->wallet;

        if (! $wallet || $wallet->balance < $request->validated('amount')) {
            return redirect()->back()->withErrors(['amount' => 'Solde insuffisant.']);
        }

        try {
            $transaction = $wallet->withdraw(
                (float) $request->validated('amount'),
                $agentProfile,
                $paymentMethod
            );

            User::notifyAdmins(new WithdrawalRequestNotification($transaction, $user));

            return redirect()->back()->with('success', 'Demande de retrait soumise avec succès !');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['amount' => $e->getMessage()]);
        }
    }
}
