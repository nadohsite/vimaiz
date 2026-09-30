<?php

namespace App\Support;

use Carbon\Carbon;
use Carbon\CarbonInterface;
use DateTimeInterface;

class ScheduledTime
{
    /**
     * The client always picks the appointment hour in this timezone,
     * regardless of the app's storage timezone (config('app.timezone') is
     * UTC). Every place that turns that naive wall-clock hour into a real
     * instant, or converts a real instant back for display, must go
     * through this timezone.
     */
    public const TIMEZONE = 'Europe/Paris';

    /**
     * Normalize a TIME / datetime value to H:i (the hour chosen by the client).
     */
    public static function toHi(mixed $time): ?string
    {
        if ($time === null || $time === '') {
            return null;
        }

        if ($time instanceof DateTimeInterface) {
            return Carbon::instance($time)->format('H:i');
        }

        $raw = trim((string) $time);

        if (preg_match('/(\d{2}:\d{2})/', $raw, $matches)) {
            return $matches[1];
        }

        try {
            return Carbon::parse($raw)->format('H:i');
        } catch (\Throwable) {
            return $raw !== '' ? $raw : null;
        }
    }

    public static function combine(CarbonInterface|string $date, mixed $time): Carbon
    {
        $dateString = $date instanceof CarbonInterface
            ? $date->format('Y-m-d')
            : Carbon::parse((string) $date)->format('Y-m-d');

        $hi = self::toHi($time) ?? '09:00';

        // The client picked this hour as a Europe/Paris wall-clock time.
        // Parse it explicitly in that timezone, then normalize to UTC for
        // storage — the app's default timezone is UTC, so parsing without
        // an explicit timezone here would silently mislabel the Paris hour
        // as if it were already UTC (a 1h/2h shift once correctly
        // converted for display elsewhere).
        return Carbon::parse($dateString.' '.$hi.':00', self::TIMEZONE)->utc();
    }
}
