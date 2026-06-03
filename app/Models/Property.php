<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    const TYPE_APPARTEMENT = 'appartement';
    const TYPE_MAISON = 'maison';
    const TYPE_VILLA = 'villa';
    const TYPE_CHALET = 'chalet';

    const TYPES = [
        self::TYPE_APPARTEMENT => 'Appartement',
        self::TYPE_MAISON => 'Maison',
        self::TYPE_VILLA => 'Villa',
        self::TYPE_CHALET => 'Chalet',
    ];

    protected $fillable = [
        'user_id',
        'type',
        'name',
        'address_line1',
        'address_line2',
        'city',
        'postal_code',
        'latitude',
        'longitude',
        'surface_area',
        'bedrooms',
        'bathrooms',
        'toilets',
        'other_rooms',
        'floors',
        'external_surface',
        'access_code',
        'entry_instructions',
        'wifi_code',
        'trash_instructions',
        'additional_info',
        'is_active',
        'checklist',
        'photos',
    ];

    protected $casts = [
        'checklist' => 'array',
        'photos' => 'array',
        'surface_area' => 'decimal:2',
        'external_surface' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    public function missions(): HasMany
    {
        return $this->hasMany(Mission::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeInCity($query, string $city)
    {
        return $query->where('city', $city);
    }

    public function scopeInPostalCode($query, string $postalCode)
    {
        return $query->where('postal_code', $postalCode);
    }

    // Accessors
    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address_line1,
            $this->address_line2,
            $this->postal_code . ' ' . $this->city,
        ]);
        return implode(', ', $parts);
    }

    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->type] ?? ucfirst($this->type);
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->name ?? $this->type_label . ' - ' . $this->city;
    }

    public function getTotalRoomsAttribute(): int
    {
        return $this->bedrooms + $this->bathrooms + $this->toilets + $this->other_rooms;
    }

    // Helpers
    public function hasActiveRequests(): bool
    {
        return $this->serviceRequests()
            ->whereNotIn('status', [ServiceRequest::STATUS_COMPLETED, ServiceRequest::STATUS_CANCELLED])
            ->exists();
    }

    public function getLastMission(): ?Mission
    {
        return $this->missions()->latest('scheduled_at')->first();
    }

    public function canBeDeleted(): bool
    {
        return !$this->hasActiveRequests();
    }

    /**
     * Distance en mètres entre ce logement et des coordonnées GPS.
     */
    public function distanceToInMeters(float $latitude, float $longitude): ?float
    {
        if (!$this->latitude || !$this->longitude) {
            return null;
        }

        $earthRadiusKm = 6371;
        $latFrom = deg2rad((float) $this->latitude);
        $lonFrom = deg2rad((float) $this->longitude);
        $latTo = deg2rad($latitude);
        $lonTo = deg2rad($longitude);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $a = sin($latDelta / 2) * sin($latDelta / 2)
            + cos($latFrom) * cos($latTo) * sin($lonDelta / 2) * sin($lonDelta / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadiusKm * $c * 1000;
    }
}
