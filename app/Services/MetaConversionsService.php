<?php

namespace App\Services;

use App\Models\Mission;
use App\Models\PlatformSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaConversionsService
{
    public function isConfigured(): bool
    {
        return PlatformSetting::metaPixelEnabled()
            && PlatformSetting::metaPixelId() !== null
            && filled(config('services.meta.access_token'));
    }

    public function trackPurchase(Mission $mission, ?Request $request = null): void
    {
        if (! $this->isConfigured()) {
            return;
        }

        $mission->loadMissing(['quote', 'client']);
        $request ??= request();

        $value = (float) ($mission->quote?->final_price ?? $mission->quote?->estimated_price ?? 0);

        $this->sendEvent([
            'event_name' => 'Purchase',
            'event_time' => time(),
            'event_id' => $mission->payment_intent_id,
            'action_source' => 'website',
            'event_source_url' => $request->fullUrl(),
            'user_data' => $this->buildUserData(
                $mission->client?->email,
                $mission->client?->phone ?? null,
                $request,
            ),
            'custom_data' => [
                'currency' => 'EUR',
                'value' => $value,
                'content_ids' => [(string) $mission->id],
                'content_type' => 'product',
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function buildUserData(?string $email, ?string $phone, Request $request): array
    {
        $data = array_filter([
            'client_ip_address' => $request->ip(),
            'client_user_agent' => $request->userAgent(),
            'fbp' => $request->cookie('_fbp'),
            'fbc' => $request->cookie('_fbc'),
        ]);

        if ($email) {
            $data['em'] = [hash('sha256', strtolower(trim($email)))];
        }

        if ($phone) {
            $normalized = preg_replace('/[^0-9]/', '', $phone);

            if ($normalized) {
                $data['ph'] = [hash('sha256', $normalized)];
            }
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $event
     */
    protected function sendEvent(array $event): void
    {
        $pixelId = PlatformSetting::metaPixelId();
        $token = config('services.meta.access_token');
        $testCode = config('services.meta.test_event_code');

        $payload = ['data' => [$event], 'access_token' => $token];

        if ($testCode) {
            $payload['test_event_code'] = $testCode;
        }

        try {
            $response = Http::post("https://graph.facebook.com/v21.0/{$pixelId}/events", $payload);

            if (! $response->successful()) {
                Log::warning('Meta Conversions API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Meta Conversions API exception', [
                'message' => $e->getMessage(),
            ]);
        }
    }
}
