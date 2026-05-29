<?php

namespace App\Support;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class UploadHelper
{
    public static function isImageUpload(mixed $file): bool
    {
        if (! $file instanceof UploadedFile) {
            return false;
        }

        $detectedMime = strtolower((string) $file->getMimeType());
        if (str_starts_with($detectedMime, 'image/')) {
            return true;
        }

        $clientMime = strtolower((string) $file->getClientMimeType());

        return str_starts_with($clientMime, 'image/');
    }

    public static function missionPhotoMaxKb(): int
    {
        return (int) config('upload.mission_photo_max_kb', 102400);
    }

    public static function propertyPhotoMaxKb(): int
    {
        return (int) config('upload.property_photo_max_kb', 102400);
    }

    public static function missionPhotoMaxMb(): int
    {
        return (int) config('upload.mission_photo_max_mb', 100);
    }

    /**
     * Detect PHP-level upload failures before Laravel's "uploaded" rule (opaque error).
     */
    public static function invalidUploadFlash(Request $request, string $key = 'photo'): ?RedirectResponse
    {
        if (! $request->hasFile($key)) {
            return null;
        }

        $file = $request->file($key);

        if ($file->isValid()) {
            return null;
        }

        return back()
            ->withInput()
            ->with('error', self::invalidFileMessage($file));
    }

    public static function invalidFileMessage(UploadedFile $file): string
    {
        $maxMb = self::missionPhotoMaxMb();

        return match ($file->getError()) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => "La photo est trop volumineuse (maximum {$maxMb} Mo). L'application compresse automatiquement les grandes images : réessayez.",
            UPLOAD_ERR_PARTIAL => 'Le téléchargement a été interrompu. Veuillez réessayer.',
            UPLOAD_ERR_NO_FILE => 'Aucun fichier reçu. Veuillez sélectionner une photo.',
            UPLOAD_ERR_NO_TMP_DIR, UPLOAD_ERR_CANT_WRITE, UPLOAD_ERR_EXTENSION => 'Erreur serveur lors du téléchargement. Contactez le support si le problème persiste.',
            default => 'Impossible de télécharger cette photo. Vérifiez le format et réessayez.',
        };
    }

    /**
     * @return array<string, string>
     */
    public static function missionPhotoValidationMessages(): array
    {
        $maxMb = self::missionPhotoMaxMb();

        return [
            'photo.required' => 'Veuillez sélectionner une photo.',
            'photo.file' => 'Le fichier est invalide.',
            'photo.max' => "La photo ne doit pas dépasser {$maxMb} Mo.",
            'photo.uploaded' => "Échec du téléchargement. La photo dépasse peut‑être la limite serveur ({$maxMb} Mo) ou le format n'est pas pris en charge.",
            'type.required' => 'Le type de photo est requis.',
            'type.in' => 'Type de photo invalide.',
        ];
    }
}
