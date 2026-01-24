<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class GeocodingService
{
    protected string $nominatimUrl = 'https://nominatim.openstreetmap.org/search';

    public function geocode(string $address, ?string $city = null, ?string $postalCode = null, ?string $country = 'France'): ?array
    {
        $fullAddress = $this->buildFullAddress($address, $city, $postalCode, $country);
        
        // Check cache first (24h TTL)
        $cacheKey = 'geocode:' . md5($fullAddress);
        
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'User-Agent' => 'VIMAIZ/1.0 (contact@vimaiz.com)',
                    'Accept-Language' => 'fr',
                ])
                ->get($this->nominatimUrl, [
                    'q' => $fullAddress,
                    'format' => 'json',
                    'limit' => 1,
                    'addressdetails' => 1,
                ]);

            if ($response->successful() && !empty($response->json())) {
                $result = $response->json()[0];
                
                $coordinates = [
                    'latitude' => (float) $result['lat'],
                    'longitude' => (float) $result['lon'],
                    'display_name' => $result['display_name'] ?? null,
                ];

                // Cache for 24 hours
                Cache::put($cacheKey, $coordinates, now()->addHours(24));

                return $coordinates;
            }

            Log::warning('Geocoding: No results found', ['address' => $fullAddress]);
            return null;

        } catch (\Exception $e) {
            Log::error('Geocoding failed', [
                'address' => $fullAddress,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    public function geocodeProperty(array $propertyData): array
    {
        // If coordinates already provided, use them
        if (!empty($propertyData['latitude']) && !empty($propertyData['longitude'])) {
            return $propertyData;
        }

        $address = $propertyData['address_line1'] ?? $propertyData['address'] ?? '';
        $city = $propertyData['city'] ?? null;
        $postalCode = $propertyData['postal_code'] ?? null;
        $country = $propertyData['country'] ?? 'France';

        $coordinates = $this->geocode($address, $city, $postalCode, $country);

        if ($coordinates) {
            $propertyData['latitude'] = $coordinates['latitude'];
            $propertyData['longitude'] = $coordinates['longitude'];
        }

        return $propertyData;
    }

    protected function buildFullAddress(string $address, ?string $city, ?string $postalCode, ?string $country): string
    {
        $parts = array_filter([
            $address,
            $postalCode,
            $city,
            $country,
        ]);

        return implode(', ', $parts);
    }

    public function reverseGeocode(float $latitude, float $longitude): ?array
    {
        $cacheKey = 'reverse_geocode:' . md5("{$latitude},{$longitude}");

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'User-Agent' => 'VIMAIZ/1.0 (contact@vimaiz.com)',
                    'Accept-Language' => 'fr',
                ])
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'lat' => $latitude,
                    'lon' => $longitude,
                    'format' => 'json',
                    'addressdetails' => 1,
                ]);

            if ($response->successful()) {
                $result = $response->json();
                
                $address = [
                    'display_name' => $result['display_name'] ?? null,
                    'address' => $result['address']['road'] ?? null,
                    'house_number' => $result['address']['house_number'] ?? null,
                    'city' => $result['address']['city'] ?? $result['address']['town'] ?? $result['address']['village'] ?? null,
                    'postal_code' => $result['address']['postcode'] ?? null,
                    'country' => $result['address']['country'] ?? null,
                ];

                Cache::put($cacheKey, $address, now()->addHours(24));

                return $address;
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Reverse geocoding failed', [
                'lat' => $latitude,
                'lon' => $longitude,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }
}
