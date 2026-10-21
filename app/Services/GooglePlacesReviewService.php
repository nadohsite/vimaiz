<?php

namespace App\Services;

use App\Models\GoogleReview;
use App\Models\PlatformSetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Récupère les avis de la fiche Google de Vimaiz via Google Places API (New).
 *
 * Google renvoie au plus 5 avis par appel (ceux qu'il juge pertinents) : à
 * chaque récupération, les nouveaux avis 4 et 5 étoiles sont ajoutés en base
 * et les existants mis à jour, la liste s'enrichit donc au fil du temps.
 */
class GooglePlacesReviewService
{
    private const ENDPOINT = 'https://places.googleapis.com/v1/places/';

    /**
     * @return array{received: int, created: int, updated: int, ignored: int}
     */
    public function fetch(): array
    {
        $apiKey = (string) config('services.google_places.key');
        $placeId = (string) config('services.google_places.place_id');

        if ($apiKey === '' || $placeId === '') {
            throw new GooglePlacesNotConfiguredException();
        }

        $response = Http::timeout(15)
            ->withHeaders([
                'X-Goog-Api-Key' => $apiKey,
                'X-Goog-FieldMask' => 'rating,userRatingCount,googleMapsUri,reviews',
            ])
            ->get(self::ENDPOINT . rawurlencode($placeId), [
                'languageCode' => 'fr',
            ]);

        if ($response->failed()) {
            $message = $response->json('error.message') ?? $response->body();
            throw new RuntimeException('Google Places a répondu ' . $response->status() . ' : ' . $message);
        }

        $data = $response->json();
        $now = now();

        $settings = PlatformSetting::current();
        $settings->forceFill([
            'google_rating' => $data['rating'] ?? null,
            'google_rating_count' => $data['userRatingCount'] ?? null,
            'google_maps_url' => $data['googleMapsUri'] ?? null,
            'google_reviews_fetched_at' => $now,
        ])->save();

        $stats = ['received' => 0, 'created' => 0, 'updated' => 0, 'ignored' => 0];

        foreach ($data['reviews'] ?? [] as $review) {
            $stats['received']++;

            $rating = (int) ($review['rating'] ?? 0);
            $googleId = $review['name'] ?? null;

            // Seuls les avis 4 et 5 étoiles sont conservés.
            if ($googleId === null || $rating < 4) {
                $stats['ignored']++;
                continue;
            }

            $attributes = [
                'author_name' => $review['authorAttribution']['displayName'] ?? 'Client Google',
                'author_url' => $review['authorAttribution']['uri'] ?? null,
                'author_photo_url' => $review['authorAttribution']['photoUri'] ?? null,
                'rating' => $rating,
                'text' => $review['text']['text'] ?? ($review['originalText']['text'] ?? null),
                'language' => $review['text']['languageCode'] ?? ($review['originalText']['languageCode'] ?? null),
                'published_at' => isset($review['publishTime']) ? Carbon::parse($review['publishTime']) : null,
                'google_maps_url' => $review['googleMapsUri'] ?? null,
                'fetched_at' => $now,
            ];

            $existing = GoogleReview::where('google_review_id', $googleId)->first();

            if ($existing) {
                // is_visible n'est jamais écrasé : un avis masqué par l'admin reste masqué.
                $existing->update($attributes);
                $stats['updated']++;
            } else {
                GoogleReview::create($attributes + ['google_review_id' => $googleId, 'is_visible' => true]);
                $stats['created']++;
            }
        }

        return $stats;
    }
}
