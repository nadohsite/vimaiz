<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\UpdateBankDetailsRequest;
use App\Http\Requests\Agent\WithdrawRequest;
use App\Models\AgentProfile;
use App\Models\User;
use App\Models\Wallet;
use App\Notifications\WithdrawalRequestNotification;
use App\Services\StripeConnectNotConfiguredException;
use App\Services\StripeConnectService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Exception\ApiErrorException;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class WalletController extends Controller
{
    public function __construct(
        protected StripeConnectService $stripeConnect
    ) {}

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
            'payoutMethods' => $agentProfile ? $agentProfile->payoutMethodsForWallet() : [],
            'stripeStatus' => $agentProfile
                ? $agentProfile->stripeConnectStatusForWallet()
                : [
                    'has_account' => false,
                    'payouts_enabled' => false,
                    'onboarding_status' => AgentProfile::STRIPE_STATUS_NOT_STARTED,
                ],
        ]);
    }

    public function updateBankDetails(UpdateBankDetailsRequest $request): RedirectResponse|SymfonyResponse
    {
        $user = $request->user();

        $agentProfile = $user->agentProfile ?? AgentProfile::create([
            'user_id' => $user->id,
            'verification_status' => 'pending',
        ]);

        // On garde le titulaire / IBAN / BIC en local (pour l'admin et les demandes
        // de retrait manuelles), Stripe reste la source de vérité pour le vrai payout.
        $agentProfile->update($request->validated());

        try {
            $accountId = $this->stripeConnect->createOrRetrieveAccount($agentProfile);
            $link = $this->stripeConnect->createAccountLink(
                $accountId,
                route('agent.wallet.stripe.refresh'),
                route('agent.wallet.stripe.return')
            );

            // Redirection externe (hors domaine Vimaiz) : Inertia::location force
            // un rechargement complet de page plutôt qu'une navigation XHR.
            return Inertia::location($link->url);
        } catch (StripeConnectNotConfiguredException $e) {
            report($e);

            return redirect()->route('agent.wallet.index')->with(
                'success',
                'Coordonnées bancaires enregistrées. La vérification de paiement Stripe n\'est pas encore configurée côté serveur, elle sera disponible prochainement.'
            );
        } catch (ApiErrorException $e) {
            Log::error('Stripe Connect (updateBankDetails): '.$e->getMessage(), [
                'user_id' => $user->id,
                'exception_class' => get_class($e),
                'http_status' => method_exists($e, 'getHttpStatus') ? $e->getHttpStatus() : null,
            ]);

            return redirect()->route('agent.wallet.index')->with(
                'success',
                'Coordonnées bancaires enregistrées. La vérification Stripe n\'a pas pu démarrer automatiquement, réessayez via "Continuer sur Stripe".'
            );
        }
    }

    /**
     * Point d'entrée du bouton "Continuer sur Stripe" affiché tant que l'onboarding
     * n'est pas terminé (ex : l'intervenant a fermé l'onglet avant de finir).
     * Toujours atteint via un clic (visite Inertia) : on répond avec Inertia::location().
     */
    public function connectOnboarding(Request $request): RedirectResponse|SymfonyResponse
    {
        $url = $this->buildOnboardingUrl($request);

        if ($url instanceof RedirectResponse) {
            return $url;
        }

        return Inertia::location($url);
    }

    /**
     * Retour navigateur après un onboarding Stripe terminé (ou interrompu).
     * Stripe redirige ici en navigation classique (pas de requête Inertia), donc
     * une simple redirection HTTP suffit. Le webhook account.updated reste la
     * source de vérité, mais on resynchronise ici tout de suite pour éviter
     * d'afficher un statut périmé à l'intervenant.
     */
    public function connectReturn(Request $request): RedirectResponse
    {
        $agentProfile = $request->user()->agentProfile;

        if ($agentProfile) {
            $this->stripeConnect->syncAccountStatus($agentProfile);
        }

        $message = $agentProfile && $agentProfile->stripe_payouts_enabled
            ? 'Votre compte de paiement Stripe est vérifié.'
            : 'Vérification Stripe enregistrée. Certaines informations sont peut-être encore à compléter.';

        return redirect()->route('agent.wallet.index')->with('success', $message);
    }

    /**
     * Stripe redirige ici (navigation classique, hors Inertia) quand le lien
     * d'onboarding a expiré et doit être régénéré.
     */
    public function connectRefresh(Request $request): RedirectResponse
    {
        $url = $this->buildOnboardingUrl($request);

        return $url instanceof RedirectResponse ? $url : redirect($url);
    }

    /**
     * Crée/récupère le compte Connect et génère un Account Link frais.
     * Retourne soit l'URL Stripe à suivre, soit une redirection d'erreur toute faite.
     */
    protected function buildOnboardingUrl(Request $request): string|RedirectResponse
    {
        $agentProfile = $request->user()->agentProfile;

        if (! $agentProfile || ! $agentProfile->hasBankDetails()) {
            return redirect()->route('agent.wallet.index')->withErrors([
                'iban' => 'Renseignez vos coordonnées bancaires avant de continuer sur Stripe.',
            ]);
        }

        try {
            $accountId = $this->stripeConnect->createOrRetrieveAccount($agentProfile);

            return $this->stripeConnect->createAccountLink(
                $accountId,
                route('agent.wallet.stripe.refresh'),
                route('agent.wallet.stripe.return')
            )->url;
        } catch (StripeConnectNotConfiguredException $e) {
            report($e);

            return redirect()->route('agent.wallet.index')->withErrors([
                'iban' => 'La vérification de paiement Stripe n\'est pas encore configurée côté serveur.',
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Stripe Connect (buildOnboardingUrl): '.$e->getMessage(), [
                'user_id' => $request->user()->id,
                'exception_class' => get_class($e),
                'http_status' => method_exists($e, 'getHttpStatus') ? $e->getHttpStatus() : null,
            ]);

            return redirect()->route('agent.wallet.index')->withErrors([
                'iban' => 'Impossible de contacter Stripe pour le moment, réessayez dans quelques instants.',
            ]);
        }
    }

    public function withdraw(WithdrawRequest $request): RedirectResponse
    {
        $user = $request->user();
        $agentProfile = $user->agentProfile;

        if (! $agentProfile || ! $agentProfile->hasBankDetails()) {
            return redirect()->back()->withErrors([
                'amount' => 'Renseignez votre IBAN avant de demander un retrait.',
            ]);
        }

        $wallet = $user->wallet;

        if (! $wallet || $wallet->balance < $request->validated('amount')) {
            return redirect()->back()->withErrors(['amount' => 'Solde insuffisant.']);
        }

        try {
            // Tant que Stripe n'a pas validé le compte (payouts_enabled), la demande
            // reste un virement manuel traité par l'admin (fallback), comme aujourd'hui.
            // Une fois payouts_enabled = true, l'étape suivante sera de déclencher un
            // Stripe Transfer ici au lieu du virement manuel.
            $transaction = $wallet->withdraw(
                (float) $request->validated('amount'),
                $agentProfile
            );

            User::notifyAdmins(new WithdrawalRequestNotification($transaction, $user));

            return redirect()->back()->with('success', 'Demande de retrait soumise avec succès !');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['amount' => $e->getMessage()]);
        }
    }
}
