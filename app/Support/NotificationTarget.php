<?php

namespace App\Support;

use App\Models\Conversation;
use App\Models\Mission;
use App\Models\Quote;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\WalletTransaction;

class NotificationTarget
{
    /**
     * @param  array<string, mixed>  $data
     */
    public static function exists(array $data): bool
    {
        return self::destination(null, $data) !== null
            || self::isStaticDestination($data);
    }

    /**
     * Resolve a URL the current user can actually open.
     * Returns null when the target is gone or not accessible.
     *
     * @param  array<string, mixed>  $data
     */
    public static function destination(?User $user, array $data): ?string
    {
        $quoteId = self::quoteId($data);
        if ($quoteId !== null) {
            return self::quoteUrl($user, $quoteId);
        }

        $missionId = self::missionId($data);
        if ($missionId !== null) {
            return self::missionUrl($user, $missionId);
        }

        $requestId = self::serviceRequestId($data);
        if ($requestId !== null) {
            return self::serviceRequestUrl($user, $requestId);
        }

        $conversationId = self::conversationId($data);
        if ($conversationId !== null) {
            return self::conversationUrl($user, $conversationId);
        }

        $url = self::rawUrl($data);
        if ($url === null) {
            return null;
        }

        if (str_contains($url, '/cleaning-requests/')) {
            return $user && ! $user->isAdmin() ? null : '/admin/service-requests';
        }

        if (str_contains($url, '/withdrawal-requests/')) {
            $transactionId = self::idFrom($data, 'transaction_id', '#/withdrawal-requests/(\d+)#');
            if ($transactionId === null || ! WalletTransaction::query()->whereKey($transactionId)->exists()) {
                return null;
            }

            return $user && ! $user->isAdmin() ? null : '/admin/wallet-transactions/'.$transactionId;
        }

        if ($user && ! self::urlAllowedFor($user, $url)) {
            return null;
        }

        return $url;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function unavailableMessage(array $data): string
    {
        if (self::quoteId($data) !== null) {
            return 'Ce devis n\'est plus disponible.';
        }

        if (self::missionId($data) !== null) {
            return 'Cette intervention n\'est plus disponible.';
        }

        if (self::serviceRequestId($data) !== null) {
            return 'Cette demande n\'est plus disponible.';
        }

        if (self::conversationId($data) !== null) {
            return 'Cette conversation n\'est plus disponible.';
        }

        return 'Cet élément n\'est plus disponible.';
    }

    public static function urlAllowedFor(User $user, string $url): bool
    {
        $path = parse_url($url, PHP_URL_PATH) ?: $url;

        if (str_starts_with($path, '/admin')) {
            return $user->isAdmin();
        }

        if (str_starts_with($path, '/client')) {
            return $user->isClient();
        }

        if (str_starts_with($path, '/agent')) {
            return $user->isAgent();
        }

        return true;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function quoteId(array $data): ?int
    {
        return self::idFrom($data, 'quote_id', '#/quotes/(\d+)#');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function missionId(array $data): ?int
    {
        return self::idFrom($data, 'mission_id', '#/missions/(\d+)#');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function serviceRequestId(array $data): ?int
    {
        return self::idFrom($data, 'service_request_id', '#/(?:requests|service-requests)/(\d+)#');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function conversationId(array $data): ?int
    {
        return self::idFrom($data, 'conversation_id', '#/messages/(\d+)#');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected static function rawUrl(array $data): ?string
    {
        $url = $data['url'] ?? null;

        return is_string($url) && $url !== '' ? $url : null;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected static function isStaticDestination(array $data): bool
    {
        $url = self::rawUrl($data);
        if ($url === null) {
            return false;
        }

        $path = parse_url($url, PHP_URL_PATH) ?: $url;

        return (bool) preg_match('#^/(dashboard|agent/dashboard|agent/documents|agent/wallet|client/requests/create|client/properties/create)$#', $path);
    }

    protected static function quoteUrl(?User $user, int $quoteId): ?string
    {
        $quote = Quote::query()->with('serviceRequest')->find($quoteId);
        if (! $quote) {
            return null;
        }

        if (! $user) {
            return route('client.quotes.show', $quote, false);
        }

        if ($user->isClient() && (int) $quote->serviceRequest?->client_id === (int) $user->id) {
            return route('client.quotes.show', $quote, false);
        }

        if ($user->isAdmin()) {
            return '/admin/quotes/'.$quote->id;
        }

        return null;
    }

    protected static function missionUrl(?User $user, int $missionId): ?string
    {
        $mission = Mission::query()->find($missionId);
        if (! $mission) {
            return null;
        }

        if (! $user) {
            return '/client/missions/'.$mission->id;
        }

        if ($user->isClient() && (int) $mission->client_id === (int) $user->id) {
            return route('client.missions.show', $mission, false);
        }

        if ($user->isAgent() && (
            $mission->agent_id === null
            || (int) $mission->agent_id === (int) $user->id
        )) {
            return route('agent.missions.show', $mission, false);
        }

        if ($user->isAdmin()) {
            return '/admin/missions/'.$mission->id;
        }

        return null;
    }

    protected static function serviceRequestUrl(?User $user, int $requestId): ?string
    {
        $request = ServiceRequest::query()->find($requestId);
        if (! $request) {
            return null;
        }

        if (! $user) {
            return '/client/requests/'.$request->id;
        }

        if ($user->isClient() && (int) $request->client_id === (int) $user->id) {
            return route('client.requests.show', $request, false);
        }

        if ($user->isAdmin()) {
            return '/admin/service-requests/'.$request->id;
        }

        return null;
    }

    protected static function conversationUrl(?User $user, int $conversationId): ?string
    {
        $conversation = Conversation::query()->find($conversationId);
        if (! $conversation) {
            return null;
        }

        if ($user && (int) $conversation->client_id !== (int) $user->id && (int) $conversation->agent_id !== (int) $user->id) {
            return null;
        }

        return '/messages/'.$conversation->id;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected static function idFrom(array $data, string $key, string $urlPattern): ?int
    {
        if (isset($data[$key]) && is_numeric($data[$key])) {
            return (int) $data[$key];
        }

        $url = $data['url'] ?? null;
        if (is_string($url) && preg_match($urlPattern, $url, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }
}
