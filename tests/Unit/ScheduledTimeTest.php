<?php

namespace Tests\Unit;

use App\Models\Mission;
use App\Models\ServiceRequest;
use App\Support\ScheduledTime;
use Carbon\Carbon;
use Tests\TestCase;

class ScheduledTimeTest extends TestCase
{
    public function test_to_hi_from_time_string(): void
    {
        $this->assertSame('09:00', ScheduledTime::toHi('09:00'));
        $this->assertSame('09:00', ScheduledTime::toHi('09:00:00'));
    }

    public function test_to_hi_from_leaked_datetime(): void
    {
        $this->assertSame('09:00', ScheduledTime::toHi('2026-08-27 09:00:00'));
        $this->assertSame('09:00', ScheduledTime::toHi('2026-08-27T09:00:00.000000Z'));
        $this->assertSame('14:30', ScheduledTime::toHi(Carbon::parse('2026-08-27 14:30:00')));
    }

    public function test_combine_keeps_client_wall_clock(): void
    {
        $scheduledAt = ScheduledTime::combine('2026-09-15', '09:00');

        $this->assertSame('2026-09-15 09:00:00', $scheduledAt->format('Y-m-d H:i:s'));
    }

    public function test_service_request_exposes_hi_time(): void
    {
        $request = new ServiceRequest;
        $request->setRawAttributes([
            'scheduled_date' => '2026-09-15',
            'scheduled_time' => '09:00:00',
        ], true);

        $this->assertSame('09:00', $request->scheduled_time);
        $this->assertSame('2026-09-15 09:00:00', $request->scheduled_datetime->format('Y-m-d H:i:s'));
    }

    public function test_mission_time_label_matches_client_request_time(): void
    {
        $request = new ServiceRequest;
        $request->setRawAttributes([
            'scheduled_date' => '2026-09-15',
            'scheduled_time' => '14:30:00',
        ], true);

        $mission = new Mission;
        $mission->scheduled_at = ScheduledTime::combine(
            $request->scheduled_date,
            $request->scheduled_time
        );

        $this->assertSame('14:30', $request->scheduled_time);
        $this->assertSame('14:30', $mission->scheduled_time_label);
        $this->assertStringContainsString('T14:30:00', $mission->scheduled_at->toISOString());
    }
}
