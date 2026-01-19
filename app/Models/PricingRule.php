<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricingRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'base_hourly_rate',
        'maison_multiplier',
        'villa_multiplier',
        'chalet_multiplier',
        'surface_threshold_m2',
        'surface_extra_rate',
        'weekend_multiplier',
        'holiday_multiplier',
        'early_morning_multiplier',
        'evening_multiplier',
        'zone_multipliers',
        'minimum_hours',
        'minimum_price',
        'platform_commission_rate',
        'is_active',
    ];

    protected $casts = [
        'base_hourly_rate' => 'decimal:2',
        'maison_multiplier' => 'decimal:2',
        'villa_multiplier' => 'decimal:2',
        'chalet_multiplier' => 'decimal:2',
        'surface_extra_rate' => 'decimal:2',
        'weekend_multiplier' => 'decimal:2',
        'holiday_multiplier' => 'decimal:2',
        'early_morning_multiplier' => 'decimal:2',
        'evening_multiplier' => 'decimal:2',
        'zone_multipliers' => 'array',
        'minimum_price' => 'decimal:2',
        'platform_commission_rate' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public static function getActive(): ?self
    {
        return self::where('is_active', true)->first();
    }

    public function getPropertyTypeMultiplier(string $type): float
    {
        return match($type) {
            'maison' => $this->maison_multiplier,
            'villa' => $this->villa_multiplier,
            'chalet' => $this->chalet_multiplier,
            default => 1.00,
        };
    }

    public function getZoneMultiplier(string $postalCode): float
    {
        if (!$this->zone_multipliers) {
            return 1.00;
        }

        $prefix = substr($postalCode, 0, 2);
        
        return $this->zone_multipliers[$prefix] ?? 1.00;
    }

    public function getTimeMultiplier(\DateTime $dateTime): float
    {
        $multiplier = 1.00;
        
        $hour = (int) $dateTime->format('H');
        $dayOfWeek = (int) $dateTime->format('N');
        
        if ($hour < 8) {
            $multiplier *= $this->early_morning_multiplier;
        } elseif ($hour >= 18) {
            $multiplier *= $this->evening_multiplier;
        }
        
        if ($dayOfWeek >= 6) {
            $multiplier *= $this->weekend_multiplier;
        }
        
        return $multiplier;
    }

    public function calculatePrice(
        string $propertyType,
        float $surfaceM2,
        int $hours,
        \DateTime $scheduledAt,
        string $postalCode
    ): array {
        $hours = max($hours, $this->minimum_hours);
        
        $basePrice = $this->base_hourly_rate * $hours;
        
        $propertyMultiplier = $this->getPropertyTypeMultiplier($propertyType);
        $basePrice *= $propertyMultiplier;
        
        if ($surfaceM2 > $this->surface_threshold_m2) {
            $extraSurface = $surfaceM2 - $this->surface_threshold_m2;
            $basePrice += $extraSurface * $this->surface_extra_rate;
        }
        
        $timeMultiplier = $this->getTimeMultiplier($scheduledAt);
        $basePrice *= $timeMultiplier;
        
        $zoneMultiplier = $this->getZoneMultiplier($postalCode);
        $basePrice *= $zoneMultiplier;
        
        $finalPrice = max($basePrice, $this->minimum_price);
        $finalPrice = round($finalPrice, 2);
        
        $commission = round($finalPrice * ($this->platform_commission_rate / 100), 2);
        $agentAmount = round($finalPrice - $commission, 2);
        
        return [
            'estimated_price' => $finalPrice,
            'commission_rate' => $this->platform_commission_rate,
            'commission_amount' => $commission,
            'agent_amount' => $agentAmount,
            'breakdown' => [
                'base_hourly_rate' => $this->base_hourly_rate,
                'hours' => $hours,
                'property_multiplier' => $propertyMultiplier,
                'surface_extra' => $surfaceM2 > $this->surface_threshold_m2 
                    ? ($surfaceM2 - $this->surface_threshold_m2) * $this->surface_extra_rate 
                    : 0,
                'time_multiplier' => $timeMultiplier,
                'zone_multiplier' => $zoneMultiplier,
            ],
        ];
    }
}
