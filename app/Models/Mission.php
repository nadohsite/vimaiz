<?php

namespace App\Models;

use App\Support\DefaultPropertyChecklist;
use App\Support\DurationFormatter;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
        'actual_duration_minutes',
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
        'checklist',
        'report_nothing_to_report',
        'report_submitted_at',
        // Retour mécontentement
        'return_requested',
        'return_status',
        'return_reason',
        'return_requested_at',
        'return_started_at',
        'return_completed_at',
        'return_validated_at',
        'return_agent_notes',
        'return_client_feedback',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'actual_duration_minutes' => 'integer',
        'report_nothing_to_report' => 'boolean',
        'report_submitted_at' => 'datetime',
        'paid_at' => 'datetime',
        'quality_reviewed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'agent_notified_at' => 'datetime',
        'agent_responded_at' => 'datetime',
        'total_price' => 'decimal:2',
        'agent_payout' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'checklist' => 'array',
        'return_requested' => 'boolean',
        'return_requested_at' => 'datetime',
        'return_started_at' => 'datetime',
        'return_completed_at' => 'datetime',
        'return_validated_at' => 'datetime',
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

    // Statuts de retour mécontentement
    const RETURN_PENDING = 'pending';

    const RETURN_IN_PROGRESS = 'in_progress';

    const RETURN_COMPLETED = 'completed';

    const RETURN_VALIDATED = 'validated';

    const RETURN_REJECTED = 'rejected';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->mission_number)) {
                $model->mission_number = 'MIS-'.strtoupper(uniqid());
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

    public function anomalies(): HasMany
    {
        return $this->hasMany(MissionAnomaly::class);
    }

    public function beforePhotos(): HasMany
    {
        return $this->hasMany(MissionPhoto::class)->where('type', 'before');
    }

    public function afterPhotos(): HasMany
    {
        return $this->hasMany(MissionPhoto::class)->where('type', 'after');
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === self::PAYMENT_PAID;
    }

    public function needsAgent(): bool
    {
        return $this->status === self::STATUS_AGENT_REFUSED ||
               ($this->status === self::STATUS_PENDING_AGENT && ! $this->agent_id);
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
        return in_array($this->status, [
            self::STATUS_IN_PROGRESS,
            self::STATUS_PHOTOS_BEFORE,
            self::STATUS_PHOTOS_AFTER,
        ], true);
    }

    public function isChecklistComplete(): bool
    {
        return DefaultPropertyChecklist::isComplete($this->checklist);
    }

    public function checklistProgress(): array
    {
        $total = 0;
        $checked = 0;

        foreach ($this->checklist ?? [] as $section) {
            foreach ($section['items'] ?? [] as $item) {
                $total++;
                if (! empty($item['checked'])) {
                    $checked++;
                }
            }
        }

        return [
            'total' => $total,
            'checked' => $checked,
            'complete' => $total === 0 || $checked === $total,
        ];
    }

    public function hasReport(): bool
    {
        return $this->report_submitted_at !== null;
    }

    public function actualDurationMinutes(): ?int
    {
        if ($this->actual_duration_minutes !== null) {
            return (int) $this->actual_duration_minutes;
        }

        if ($this->started_at && $this->completed_at) {
            return max(0, (int) $this->started_at->diffInMinutes($this->completed_at));
        }

        if ($this->started_at && $this->canComplete()) {
            return max(0, (int) $this->started_at->diffInMinutes(now()));
        }

        return null;
    }

    public function estimatedDurationMinutes(): ?int
    {
        if ($this->duration_hours === null) {
            return null;
        }

        return (int) round((float) $this->duration_hours * 60);
    }

    public function getActualDurationLabelAttribute(): ?string
    {
        $minutes = $this->actualDurationMinutes();

        return $minutes === null ? null : DurationFormatter::minutes($minutes);
    }

    public function getEstimatedDurationLabelAttribute(): ?string
    {
        $minutes = $this->estimatedDurationMinutes();

        return $minutes === null ? null : DurationFormatter::minutes($minutes);
    }

    public function reportSummary(): array
    {
        $progress = $this->checklistProgress();

        return [
            'submitted' => $this->hasReport(),
            'nothing_to_report' => (bool) $this->report_nothing_to_report,
            'submitted_at' => $this->report_submitted_at?->toIso8601String(),
            'checklist' => $progress,
            'anomalies_count' => $this->relationLoaded('anomalies')
                ? $this->anomalies->count()
                : $this->anomalies()->count(),
            'actual_duration_minutes' => $this->actualDurationMinutes(),
            'actual_duration_label' => $this->actual_duration_label,
            'estimated_duration_minutes' => $this->estimatedDurationMinutes(),
            'estimated_duration_label' => $this->estimated_duration_label,
        ];
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING_AGENT => 'Intervention en attente',
            self::STATUS_AGENT_ACCEPTED => 'Intervention confirmée',
            self::STATUS_AGENT_REFUSED => 'Intervention refusée',
            self::STATUS_IN_PROGRESS => 'Intervention en cours',
            self::STATUS_PHOTOS_BEFORE => 'Photos avant OK',
            self::STATUS_PHOTOS_AFTER => 'Photos après OK',
            self::STATUS_COMPLETED => $this->relationLoaded('review') && $this->review
                ? 'Bien prêt'
                : ($this->review()->exists() ? 'Bien prêt' : 'Intervention terminée'),
            self::STATUS_CANCELLED => 'Annulée',
            default => $this->status,
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
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
        return match ($this->payment_status) {
            self::PAYMENT_PENDING => 'En attente',
            self::PAYMENT_PAID => 'Payé',
            self::PAYMENT_REFUNDED => 'Remboursé',
            default => $this->payment_status,
        };
    }

    // Méthodes pour la gestion des retours mécontentement
    public function hasReturnRequested(): bool
    {
        return $this->return_requested === true;
    }

    public function canRequestReturn(): bool
    {
        return $this->status === self::STATUS_COMPLETED
            && ! $this->return_requested
            && $this->completed_at
            && $this->completed_at->diffInDays(now()) <= 7; // 7 jours pour demander un retour
    }

    public function getReturnStatusLabelAttribute(): ?string
    {
        if (! $this->return_status) {
            return null;
        }

        return match ($this->return_status) {
            self::RETURN_PENDING => 'Retour demandé',
            self::RETURN_IN_PROGRESS => 'Retour en cours',
            self::RETURN_COMPLETED => 'Retour effectué',
            self::RETURN_VALIDATED => 'Retour validé',
            self::RETURN_REJECTED => 'Retour refusé',
            default => $this->return_status,
        };
    }

    public function getReturnStatusColorAttribute(): ?string
    {
        if (! $this->return_status) {
            return null;
        }

        return match ($this->return_status) {
            self::RETURN_PENDING => 'warning',
            self::RETURN_IN_PROGRESS => 'info',
            self::RETURN_COMPLETED => 'primary',
            self::RETURN_VALIDATED => 'success',
            self::RETURN_REJECTED => 'danger',
            default => 'secondary',
        };
    }
}
