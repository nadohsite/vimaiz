<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class PlatformSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever("platform_setting.{$key}", function () use ($key, $default) {
            $setting = static::query()->where('key', $key)->first();

            if (! $setting) {
                return $default;
            }

            $decoded = json_decode($setting->value, true);

            return json_last_error() === JSON_ERROR_NONE ? $decoded : $setting->value;
        });
    }

    public static function set(string $key, mixed $value): void
    {
        $storedValue = is_array($value) || is_bool($value) || is_numeric($value)
            ? json_encode($value)
            : (string) $value;

        static::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $storedValue]
        );

        Cache::forget("platform_setting.{$key}");
    }

    public static function allSettings(): array
    {
        return [
            'commission_rate' => (float) static::get('commission_rate', config('vimaiz.commission_rate')),
            'agents_per_proposal' => (int) static::get('agents_per_proposal', config('vimaiz.mission.agents_per_proposal')),
            'manual_verification' => (bool) static::get('manual_verification', config('vimaiz.agent.manual_verification')),
            'minimum_advance_hours' => (int) static::get('minimum_advance_hours', config('vimaiz.booking.minimum_advance_hours')),
            'maximum_advance_days' => (int) static::get('maximum_advance_days', config('vimaiz.booking.maximum_advance_days')),
            'cancellation_deadline_hours' => (int) static::get('cancellation_deadline_hours', config('vimaiz.booking.cancellation_deadline_hours')),
        ];
    }
}
