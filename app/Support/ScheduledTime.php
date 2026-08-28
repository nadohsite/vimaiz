<?php

namespace App\Support;

use Carbon\Carbon;
use Carbon\CarbonInterface;
use DateTimeInterface;

class ScheduledTime
{
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

        return Carbon::parse($dateString.' '.$hi.':00');
    }
}
