<?php

namespace Tests\Unit;

use App\Services\GeographicMatchingService;
use App\Support\Geo;
use Tests\TestCase;

class GeographicMatchingServiceTest extends TestCase
{
    private GeographicMatchingService $matching;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'vimaiz.matching.standard_radius_km' => 30,
            'vimaiz.matching.extended_radius_km' => 150,
            'vimaiz.matching.extended_min_payout_per_km' => 2.5,
        ]);

        $this->matching = new GeographicMatchingService;
    }

    public function test_chambery_to_aix_is_standard_zone(): void
    {
        $km = Geo::distanceKm(45.5646, 5.9178, 45.6885, 5.9154);

        $this->assertLessThan(20, $km);

        $result = $this->matching->evaluate($km, 60);

        $this->assertTrue($result['eligible']);
        $this->assertSame(GeographicMatchingService::ZONE_STANDARD, $result['zone']);
    }

    public function test_low_payout_beyond_30km_is_rejected(): void
    {
        $result = $this->matching->evaluate(55, 60);

        $this->assertFalse($result['eligible']);
        $this->assertNull($result['zone']);
    }

    public function test_high_payout_beyond_30km_is_extended_zone(): void
    {
        $result = $this->matching->evaluate(55, 300);

        $this->assertTrue($result['eligible']);
        $this->assertSame(GeographicMatchingService::ZONE_EXTENDED, $result['zone']);
    }

    public function test_paris_to_chambery_is_never_eligible(): void
    {
        $km = Geo::distanceKm(48.8566, 2.3522, 45.5646, 5.9178);

        $this->assertGreaterThan(400, $km);

        $result = $this->matching->evaluate($km, 500);

        $this->assertFalse($result['eligible']);
    }

    public function test_lyon_to_annecy_depends_on_payout(): void
    {
        $km = Geo::distanceKm(45.7640, 4.8357, 45.8992, 6.1294);

        $this->assertGreaterThan(90, $km);
        $this->assertLessThan(150, $km);

        $this->assertFalse($this->matching->evaluate($km, 80)['eligible']);
        $this->assertTrue($this->matching->evaluate($km, 300)['eligible']);
    }

    public function test_distance_above_extended_radius_is_rejected_even_with_high_payout(): void
    {
        $result = $this->matching->evaluate(151, 1000);

        $this->assertFalse($result['eligible']);
    }
}
