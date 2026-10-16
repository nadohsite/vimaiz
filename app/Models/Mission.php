<?php

namespace App\Models;

use App\Services\GeographicMatchingService;
use App\Support\DefaultPropertyChecklist;
use App\Support\DurationFormatter;
use App\Support\ScheduledTime;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

// Brigades multi-agents (cahier des charges "grands espaces", Volets 6-7,
// octobre 2026) — voir le plan technique dans le projet Claude Vimaiz.
use App\Models\MissionAgent;

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
        'required_agents',
        'accepted_agents_count',
        'client_validated_at',
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
        'required_agents' => 'integer',
        'accepted_agents_count' => 'integer',
        'client_validated_at' => 'datetime',
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

    // status_label used to be appended by hand in each controller's show()
    // method and forgotten in index() (list pages), leaving the status
    // badge blank there. Appending it globally here fixes both at once.
    protected $appends = [
        'scheduled_time_label',
        'status_label',
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

    public function missionAgents(): HasMany
    {
        return $this->hasMany(MissionAgent::class);
    }

    public function declinedAgents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'mission_declines', 'mission_id', 'agent_id')
            ->withPivot('reason')
            ->withTimestamps();
    }

    public function hasBeenDeclinedBy(User $agent): bool
    {
        if ($this->relationLoaded('declinedAgents')) {
            return $this->declinedAgents->contains('id', $agent->id);
        }

        return $this->declinedAgents()->where('users.id', $agent->id)->exists();
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

    /**
     * Nombre de créneaux de brigade encore ouverts (ni acceptés, ni déjà
     * proposés à un agent en attente de réponse).
     */
    public function openSlotsCount(): int
    {
        $filled = $this->missionAgents()
            ->whereIn('status', MissionAgent::ACTIVE_STATUSES)
            ->count();

        return max(0, (int) $this->required_agents - $filled);
    }

    public function isFullyStaffed(): bool
    {
        return $this->accepted_agents_count >= $this->required_agents;
    }

    public function isOpenForAgents(): bool
    {
        return $this->status === self::STATUS_PENDING_AGENT
            && $this->isPaid()
            && ! $this->isFullyStaffed();
    }

    public function isVisibleToAgent(User $agent): bool
    {
        $isBrigadeMember = $this->missionAgents()
            ->where('agent_id', $agent->id)
            ->whereIn('status', MissionAgent::ACTIVE_STATUSES)
            ->exists();

        if ($isBrigadeMember) {
            return true;
        }

        if ($this->hasBeenDeclinedBy($agent)) {
            return false;
        }

        if (! $this->isOpenForAgents()) {
            return false;
        }

        $geo = app(GeographicMatchingService::class);

        if ($geo->hasPendingMission($agent)) {
            return false;
        }

        return $geo->isGeographicallyEligible($agent, $this);
    }

    public function scopeVisibleToAgent($query, User $agent)
    {
        $openIds = app(GeographicMatchingService::class)
            ->visibleOpenMissionIdsFor($agent);

        // Brigades : un agent co-assigné doit voir la mission même s'il
        // n'est pas (ou plus) l'agent_id "référent".
        $memberMissionIds = MissionAgent::where('agent_id', $agent->id)
            ->whereIn('status', MissionAgent::ACTIVE_STATUSES)
            ->pluck('mission_id');

        return $query->where(function ($q) use ($agent, $openIds, $memberMissionIds) {
            $q->where('agent_id', $agent->id);

            if ($memberMissionIds->isNotEmpty()) {
                $q->orWhereIn('id', $memberMissionIds);
            }

            if ($openIds !== []) {
                $q->orWhereIn('id', $openIds);
            }
        });
    }

    public function needsAgent(): bool
    {
        return $this->status === self::STATUS_AGENT_REFUSED || $this->isOpenForAgents();
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

    public function getScheduledTimeLabelAttribute(): ?string
    {
        // scheduled_at is stored as a real UTC instant — convert back to
        // the business timezone before formatting, otherwise this label
        // shows the raw UTC hour instead of the hour the client picked.
        return $this->scheduled_at?->copy()->timezone(ScheduledTime::TIMEZONE)->format('H:i');
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
            && $this->completed_at->greaterThanOrEqualTo(now()->subHours(48));
    }

    /**
     * Volet 7 — validation anticipée du client avant l'échéance des 48h :
     * débloque immédiatement le paiement retenu des intervenants au lieu
     * d'attendre le job planifié vimaiz:release-held-mission-payouts.
     */
    public function canValidateNow(): bool
    {
        return $this->status === self::STATUS_COMPLETED && ! $this->client_validated_at;
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
