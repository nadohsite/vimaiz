<?php

namespace App\Support;

class DurationFormatter
{
    public static function minutes(?int $minutes): string
    {
        if ($minutes === null || $minutes < 0) {
            return '—';
        }

        if ($minutes < 60) {
            return $minutes.' min';
        }

        $hours = intdiv($minutes, 60);
        $rest = $minutes % 60;

        if ($rest === 0) {
            return $hours.'h';
        }

        return $hours.'h'.str_pad((string) $rest, 2, '0', STR_PAD_LEFT);
    }

    public static function hours(?float $hours): string
    {
        if ($hours === null || $hours <= 0) {
            return '—';
        }

        return self::minutes((int) round($hours * 60));
    }
}
