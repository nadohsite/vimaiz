<?php

namespace App\Support;

class EmailBranding
{
    public const SLOGAN = 'La décoration attire le regard. La propreté inspire confiance.';

    /**
     * Logo email optimisé (blanc sur fond transparent).
     */
    public static function logoPath(): string
    {
        return public_path('vimaiz-logo-email-white.png');
    }

    /**
     * Source img pour les mails.
     * - URL publique en prod (meilleure compatibilité Gmail)
     * - data-URI en local / si APP_URL est inaccessible depuis la boîte mail
     */
    public static function logoSrc(?object $message = null): string
    {
        $path = self::logoPath();

        if ($message && method_exists($message, 'embed') && is_file($path)) {
            try {
                return $message->embed($path);
            } catch (\Throwable) {
                // fallback below
            }
        }

        $appUrl = rtrim((string) config('app.url'), '/');
        $isLocalUrl = $appUrl === ''
            || str_contains($appUrl, 'localhost')
            || str_contains($appUrl, '127.0.0.1');

        if (!$isLocalUrl && is_file($path)) {
            return $appUrl.'/vimaiz-logo-email-white.png';
        }

        return self::logoDataUri();
    }

    public static function logoDataUri(): string
    {
        $path = self::logoPath();

        if (! is_file($path)) {
            return '';
        }

        return 'data:image/png;base64,'.base64_encode((string) file_get_contents($path));
    }
}
