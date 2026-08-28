<?php

namespace App\Support;

use App\Models\Mission;
use App\Models\Quote;
use App\Models\ServiceRequest;

class NotificationTarget
{
    /**
     * @param  array<string, mixed>  $data
     */
    public static function exists(array $data): bool
    {
        $quoteId = self::quoteId($data);
        if ($quoteId !== null) {
            return Quote::query()->whereKey($quoteId)->exists();
        }

        $missionId = self::missionId($data);
        if ($missionId !== null) {
            return Mission::query()->whereKey($missionId)->exists();
        }

        $requestId = self::serviceRequestId($data);
        if ($requestId !== null) {
            return ServiceRequest::query()->whereKey($requestId)->exists();
        }

        return true;
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

        return 'Cet élément n\'est plus disponible.';
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
