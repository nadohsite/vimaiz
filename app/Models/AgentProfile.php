<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'siret',
        'company_type',
        'company_name',
        'bank_account_holder',
        'iban',
        'bic',
        'tva_number',
        'website',
        'description',
        'experience_years',
        'hourly_rate',
        'service_radius_km',
        'has_own_equipment',
        'has_driving_license',
        'has_vehicle',
        'vehicle_type',
        'covered_zones',
        'coverage_radius_km',
        'internal_rating',
        'missions_completed',
        'missions_cancelled',
        'missions_refused',
        'admin_notes',
        'warning_count',
        'suspended_until',
        'suspension_reason',
        'id_document',
        'address_proof',
        'profile_photo',
        'siret_document',
        'driving_license_document',
        'insurance_document',
        'verification_status',
        'rejection_reason',
        'verified_at',
        'average_rating',
        'total_reviews',
        'total_bookings',
        'is_available',
        'supported_property_types',
        'max_surface_area',
        'is_banned',
        'banned_at',
        'ban_reason',
        'rcp_clause_accepted',
        'rcp_clause_accepted_at',
    ];

    protected $hidden = [
        'iban',
        'bic',
        'bank_account_holder',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'suspended_until' => 'datetime',
        'hourly_rate' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'internal_rating' => 'decimal:2',
        'is_available' => 'boolean',
        'has_own_equipment' => 'boolean',
        'has_driving_license' => 'boolean',
        'has_vehicle' => 'boolean',
        'supported_property_types' => 'array',
        'covered_zones' => 'array',
        'max_surface_area' => 'integer',
        'is_banned' => 'boolean',
        'banned_at' => 'datetime',
        'rcp_clause_accepted' => 'boolean',
        'rcp_clause_accepted_at' => 'datetime',
    ];

    const COMPANY_TYPE_AUTO_ENTREPRENEUR = 'auto_entrepreneur';
    const COMPANY_TYPE_SOCIETE = 'societe';

    public const PAYOUT_BANK_TRANSFER = 'bank_transfer';

    /** @deprecated Kept for historical withdrawal metadata display */
    public const PAYOUT_MOBILE_MONEY = 'mobile_money';

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function services()
    {
        return $this->belongsToMany(Service::class, 'agent_services')
            ->withPivot('custom_price')
            ->withTimestamps();
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'agent_id', 'user_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'agent_id', 'user_id');
    }

    public function payouts()
    {
        return $this->hasMany(AgentPayout::class, 'agent_id', 'user_id');
    }

    public function availabilities()
    {
        return $this->hasMany(Availability::class);
    }

    public function sanctions()
    {
        return $this->hasMany(AgentSanction::class)->orderBy('created_at', 'desc');
    }

    // Scopes
    public function scopeIndividuals($query)
    {
        return $query->where('type', 'individual');
    }

    public function scopeCompanies($query)
    {
        return $query->where('type', 'company');
    }

    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }

    public function scopePending($query)
    {
        return $query->where('verification_status', 'pending');
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    // Helpers
    public function isVerified(): bool
    {
        return $this->verification_status === 'verified';
    }

    public function needsDocuments(): bool
    {
        if (in_array($this->verification_status, ['submitted', 'verified'], true)) {
            return false;
        }

        return true;
    }

    public function hasBankDetails(): bool
    {
        return filled($this->iban) && filled($this->bank_account_holder);
    }

    public function hasPayoutMethod(): bool
    {
        return $this->hasBankDetails();
    }

    public static function normalizeIban(?string $iban): ?string
    {
        if ($iban === null || trim($iban) === '') {
            return null;
        }

        return strtoupper((string) preg_replace('/\s+/', '', $iban));
    }

    public static function formatIban(?string $iban): ?string
    {
        $normalized = self::normalizeIban($iban);

        if (! $normalized) {
            return null;
        }

        return trim(chunk_split($normalized, 4, ' '));
    }

    public function bankDetailsForWallet(): array
    {
        return [
            'iban' => self::formatIban($this->iban),
            'bic' => $this->bic,
            'bank_account_holder' => $this->bank_account_holder,
            'is_complete' => $this->hasBankDetails(),
        ];
    }

    public function payoutMethodsForWallet(): array
    {
        if (! $this->hasBankDetails()) {
            return [];
        }

        return [[
            'id' => self::PAYOUT_BANK_TRANSFER,
            'label' => 'Virement bancaire',
            'summary' => trim(($this->bank_account_holder ?? '').' — '.self::formatIban($this->iban)),
        ]];
    }

    public function updateRating()
    {
        $this->average_rating = $this->reviews()->avg('rating') ?? 0;
        $this->total_reviews = $this->reviews()->count();
        $this->save();
    }

    public function missions()
    {
        return $this->hasMany(Mission::class, 'agent_id', 'user_id');
    }

    public function isSuspended(): bool
    {
        return $this->suspended_until && $this->suspended_until->isFuture();
    }

    public function isEligibleForMissions(): bool
    {
        return $this->isVerified() 
            && $this->is_available 
            && !$this->isSuspended()
            && $this->has_own_equipment
            && $this->has_driving_license
            && $this->has_vehicle;
    }

    public function coversZone(string $postalCode): bool
    {
        if (empty($this->covered_zones)) {
            return true;
        }
        
        $prefix = substr($postalCode, 0, 2);
        return in_array($postalCode, $this->covered_zones) 
            || in_array($prefix, $this->covered_zones);
    }

    public function incrementMissionsCompleted(): void
    {
        $this->increment('missions_completed');
    }

    public function incrementMissionsCancelled(): void
    {
        $this->increment('missions_cancelled');
    }

    public function incrementMissionsRefused(): void
    {
        $this->increment('missions_refused');
    }

    public function addWarning(string $reason): void
    {
        $this->increment('warning_count');
        $this->admin_notes = ($this->admin_notes ?? '') . "\n[" . now()->format('Y-m-d H:i') . "] Avertissement: " . $reason;
        $this->save();
    }

    public function suspend(\DateTime $until, string $reason): void
    {
        $this->suspended_until = $until;
        $this->suspension_reason = $reason;
        $this->admin_notes = ($this->admin_notes ?? '') . "\n[" . now()->format('Y-m-d H:i') . "] Suspendu jusqu'au " . $until->format('Y-m-d') . ": " . $reason;
        $this->save();
    }
}
