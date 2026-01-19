<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mission extends Model
{
    use HasFactory;

    protected $fillable = [
        'mission_number',
        'service_request_id',
        'quote_id',
        'property_id',
        'client_id',
        'agent_id',
        'scheduled_at',
        'duration_hours',
        'started_at',
        'completed_at',
        'total_price',
        'agent_payout',
        'platform_fee',
        'status',
        'payment_status',
        'payment_intent_id',
        'paid_at',
        'internal_quality_score',
        'internal_quality_notes',
        'quality_reviewed_by',
        'quality_reviewed_at',
        'cancellation_reason',
        'cancelled_at',
        'agent_notified_at',
        'agent_responded_at',
        'assignment_attempts',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'paid_at' => 'datetime',
        'quality_reviewed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'agent_notified_at' => 'datetime',
        'agent_responded_at' => 'datetime',
        'total_price' => 'decimal:2',
        'agent_payout' => 'decimal:2',
        'platform_fee' => 'decimal:2',
    ];

    const STATUS_PENDING_AGENT = 'pending_agent';
    const STATUS_AGENT_ACCEPTED = 'agent_accepted';
    const STATUS_AGENT_REFUSED = 'agent_refused';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_PHOTOS_BEFORE = 'photos_before';
    const STATUS_PHOTOS_AFTER = 'photos_after';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    const PAYMENT_PENDING = 'pending';
    const PAYMENT_PAID = 'paid';
    const PAYMENT_REFUNDED = 'refunded';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->mission_number)) {
                $model->mission_number = 'MIS-' . strtoupper(uniqid());
            }
        });
    }

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function qualityReviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'quality_reviewed_by');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(MissionPhoto::class);
    }

    public function beforePhotos(): HasMany
    {
        return $this->hasMany(MissionPhoto::class)->where('type', 'before');
    }

    public function afterPhotos(): HasMany
    {
        return $this->hasMany(MissionPhoto::class)->where('type', 'after');
    }

    public function isPaid(): bool
    {
        return $this->payment_status === self::PAYMENT_PAID;
    }

    public function needsAgent(): bool
    {
        return $this->status === self::STATUS_AGENT_REFUSED || 
               ($this->status === self::STATUS_PENDING_AGENT && !$this->agent_id);
    }

    public function canStart(): bool
    {
        return $this->status === self::STATUS_AGENT_ACCEPTED && 
               $this->payment_status === self::PAYMENT_PAID;
    }

    public function hasBeforePhotos(): bool
    {
        return $this->beforePhotos()->count() >= 3;
    }

    public function hasAfterPhotos(): bool
    {
        return $this->afterPhotos()->count() >= 3;
    }

    public function canComplete(): bool
    {
        return $this->hasBeforePhotos() && $this->hasAfterPhotos();
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING_AGENT => 'En attente agent',
            self::STATUS_AGENT_ACCEPTED => 'Agent confirmé',
            self::STATUS_AGENT_REFUSED => 'Agent refusé',
            self::STATUS_IN_PROGRESS => 'En cours',
            self::STATUS_PHOTOS_BEFORE => 'Photos avant OK',
            self::STATUS_PHOTOS_AFTER => 'Photos après OK',
            self::STATUS_COMPLETED => 'Terminée',
            self::STATUS_CANCELLED => 'Annulée',
            default => $this->status,
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING_AGENT => 'warning',
            self::STATUS_AGENT_ACCEPTED => 'info',
            self::STATUS_AGENT_REFUSED => 'danger',
            self::STATUS_IN_PROGRESS => 'primary',
            self::STATUS_PHOTOS_BEFORE => 'info',
            self::STATUS_PHOTOS_AFTER => 'info',
            self::STATUS_COMPLETED => 'success',
            self::STATUS_CANCELLED => 'danger',
            default => 'secondary',
        };
    }

    public function getPaymentStatusLabelAttribute(): string
    {
        return match($this->payment_status) {
            self::PAYMENT_PENDING => 'En attente',
            self::PAYMENT_PAID => 'Payé',
            self::PAYMENT_REFUNDED => 'Remboursé',
            default => $this->payment_status,
        };
    }
}
