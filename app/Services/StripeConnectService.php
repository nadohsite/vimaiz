<?php

namespace App\Services;

use App\Models\AgentProfile;
use Illuminate\Support\Facades\Log;
use Stripe\Account;
use Stripe\AccountLink;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

/**
 * Gère la création et le suivi des comptes Stripe Connect Express des intervenants.
 *
 * Flux : l'intervenant enregistre son RIB (titulaire/IBAN/BIC) qui reste stocké
 * en local sur agent_profiles (pour l'admin et les demandes de retrait). En parallèle,
 * ce service crée (ou récupère) un compte Connect Express côté Stripe et génère un
 * Account Link d'onboarding : c'est Stripe qui collecte ensuite l'identité et les
 * informations bancaires réelles de paiement, selon le pays de l'intervenant.
 */
class StripeConnectService
{
    protected ?StripeClient $client = null;

    /**
     * Le client Stripe n'est construit qu'au premier appel réel à l'API,
     * jamais dans le constructeur : ce service est injecté dans WalletController
     * pour TOUTES ses actions (y compris la simple consultation du portefeuille),
     * donc une clé Stripe absente ne doit jamais faire planter l'affichage de la page.
     */
    protected function client(): StripeClient
    {
        if ($this->client === null) {
            $this->client = new StripeClient($this->requireSecretKey());
        }

        return $this->client;
    }

    protected function requireSecretKey(): string
    {
        $secret = config('services.stripe.secret') ?: config('cashier.secret');

        if (blank($secret)) {
            throw new StripeConnectNotConfiguredException(
                'Clé Stripe manquante (STRIPE_SECRET ou CASHIER_SECRET dans .env).'
            );
        }

        return $secret;
    }

    public function isConfigured(): bool
    {
        return filled(config('services.stripe.secret') ?: config('cashier.secret'));
    }

    /**
     * Crée le compte Connect Express de l'intervenant s'il n'existe pas encore,
     * et retourne son identifiant Stripe (acct_...).
     */
    public function createOrRetrieveAccount(AgentProfile $profile): string
    {
        if (filled($profile->stripe_account_id)) {
            return $profile->stripe_account_id;
        }

        $account = $this->client()->accounts->create([
            'type' => 'express',
            'country' => config('services.stripe.connect_country', 'FR'),
            'email' => $profile->user?->email,
            'business_type' => $profile->company_type === AgentProfile::COMPANY_TYPE_SOCIETE
                ? 'company'
                : 'individual',
            'capabilities' => [
                'transfers' => ['requested' => true],
            ],
            'metadata' => [
                'agent_profile_id' => (string) $profile->id,
                'user_id' => (string) $profile->user_id,
            ],
        ]);

        $profile->update([
            'stripe_account_id' => $account->id,
            'stripe_onboarding_status' => AgentProfile::STRIPE_STATUS_INCOMPLETE,
        ]);

        return $account->id;
    }

    /**
     * Crée un lien d'onboarding Stripe (Account Link). Ce lien expire rapidement
     * (quelques minutes) : il doit être généré juste avant la redirection, jamais stocké.
     */
    public function createAccountLink(string $accountId, string $refreshUrl, string $returnUrl): AccountLink
    {
        return $this->client()->accountLinks->create([
            'account' => $accountId,
            'refresh_url' => $refreshUrl,
            'return_url' => $returnUrl,
            'type' => 'account_onboarding',
        ]);
    }

    /**
     * Recharge le compte Stripe et synchronise le statut local (payouts_enabled,
     * onboarding_status). Utilisé au retour d'onboarding, en complément du webhook
     * account.updated qui peut arriver avec un léger décalage.
     */
    public function syncAccountStatus(AgentProfile $profile): void
    {
        if (blank($profile->stripe_account_id)) {
            return;
        }

        try {
            $account = $this->client()->accounts->retrieve($profile->stripe_account_id);
        } catch (ApiErrorException|StripeConnectNotConfiguredException $e) {
            Log::warning('Stripe Connect: impossible de récupérer le compte '.$profile->stripe_account_id.' : '.$e->getMessage());

            return;
        }

        $this->applyAccountStatus($profile, $account);
    }

    /**
     * Met à jour un AgentProfile à partir d'un objet Stripe\Account déjà chargé
     * (appelé depuis syncAccountStatus() et depuis le webhook account.updated).
     */
    public function applyAccountStatus(AgentProfile $profile, Account $account): void
    {
        $status = AgentProfile::STRIPE_STATUS_INCOMPLETE;

        if ($account->payouts_enabled) {
            $status = AgentProfile::STRIPE_STATUS_VERIFIED;
        } elseif ($account->details_submitted) {
            $status = AgentProfile::STRIPE_STATUS_PENDING;
        }

        $profile->update([
            'stripe_payouts_enabled' => (bool) $account->payouts_enabled,
            'stripe_onboarding_status' => $status,
        ]);
    }

    public function findProfileByAccountId(string $accountId): ?AgentProfile
    {
        return AgentProfile::where('stripe_account_id', $accountId)->first();
    }
}
