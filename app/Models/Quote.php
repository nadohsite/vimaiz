<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = [
        'quote_number',
        'service_request_id',
        'estimated_price',
        'final_price',
        'commission_rate',
        'commission_amount',
        'agent_amount',
        'admin_notes',
        'price_adjustment_reason',
        'status',
        'validated_by',
        'sent_at',
        'responded_at',
        'expires_at',
    ];

    protected $casts = [
        'estimated_price' => 'decimal:2',
        'final_price' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'agent_amount' => 'decimal:2',
        'sent_at' => 'datetime',
        'responded_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    const STATUS_DRAFT = 'draft';
    const STATUS_SENT = 'sent';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_REFUSED = 'refused';
    const STATUS_EXPIRED = 'expired';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->quote_number)) {
                $model->quote_number = 'DEV-' . strtoupper(uniqid());
            }
        });
    }

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function validatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function mission(): HasOne
    {
        return $this->hasOne(Mission::class);
    }

    public function getEffectivePriceAttribute(): float
    {
        return $this->final_price ?? $this->estimated_price;
    }

    public function calculateCommission(): void
    {
        $price = $this->effective_price;
        $this->commission_amount = round($price * ($this->commission_rate / 100), 2);
        $this->agent_amount = round($price - $this->commission_amount, 2);
    }

    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function isSent(): bool
    {
        return $this->status === self::STATUS_SENT;
    }

    public function isAccepted(): bool
    {
        return $this->status === self::STATUS_ACCEPTED;
    }

    public function isExpired(): bool
    {
        if ($this->status === self::STATUS_EXPIRED) {
            return true;
        }
        
        if ($this->expires_at && $this->expires_at->isPast() && $this->status === self::STATUS_SENT) {
            return true;
        }
        
        return false;
    }

    public function canBeAccepted(): bool
    {
        return $this->status === self::STATUS_SENT && !$this->isExpired();
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            self::STATUS_DRAFT => 'Brouillon',
            self::STATUS_SENT => 'Envoyé',
            self::STATUS_ACCEPTED => 'Accepté',
            self::STATUS_REFUSED => 'Refusé',
            self::STATUS_EXPIRED => 'Expiré',
            default => $this->status,
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_DRAFT => 'secondary',
            self::STATUS_SENT => 'info',
            self::STATUS_ACCEPTED => 'success',
            self::STATUS_REFUSED => 'danger',
            self::STATUS_EXPIRED => 'warning',
            default => 'secondary',
        };
    }
}
