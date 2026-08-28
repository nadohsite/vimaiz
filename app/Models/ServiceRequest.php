<?php

namespace App\Models;

use App\Support\ScheduledTime;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ServiceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_number',
        'client_id',
        'property_id',
        'scheduled_date',
        'scheduled_time',
        'requested_hours',
        'special_instructions',
        'checklist',
        'status',
        'cancellation_reason',
        'cancelled_at',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'cancelled_at' => 'datetime',
        'checklist' => 'array',
    ];

    const STATUS_PENDING = 'pending';

    const STATUS_QUOTE_SENT = 'quote_sent';

    const STATUS_QUOTE_ACCEPTED = 'quote_accepted';

    const STATUS_QUOTE_REFUSED = 'quote_refused';

    const STATUS_PAID = 'paid';

    const STATUS_ASSIGNED = 'assigned';

    const STATUS_IN_PROGRESS = 'in_progress';

    const STATUS_COMPLETED = 'completed';

    const STATUS_CANCELLED = 'cancelled';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->request_number)) {
                $model->request_number = 'REQ-'.strtoupper(uniqid());
            }
        });
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function quote(): HasOne
    {
        return $this->hasOne(Quote::class);
    }

    public function mission(): HasOne
    {
        return $this->hasOne(Mission::class);
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isQuoteSent(): bool
    {
        return $this->status === self::STATUS_QUOTE_SENT;
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, [
            self::STATUS_PENDING,
            self::STATUS_QUOTE_SENT,
            self::STATUS_QUOTE_ACCEPTED,
        ]);
    }

    public function getScheduledDateTimeAttribute(): Carbon
    {
        return ScheduledTime::combine($this->scheduled_date, $this->scheduled_time);
    }

    /**
     * Heure saisie par le client, toujours au format H:i.
     */
    protected function scheduledTime(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value): ?string => ScheduledTime::toHi($value),
            set: function (?string $value): ?string {
                $hi = ScheduledTime::toHi($value);

                return $hi ? $hi.':00' : null;
            },
        );
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'En attente de devis',
            self::STATUS_QUOTE_SENT => 'Devis envoyé',
            self::STATUS_QUOTE_ACCEPTED => 'Devis accepté',
            self::STATUS_QUOTE_REFUSED => 'Devis refusé',
            self::STATUS_PAID => 'Payé',
            self::STATUS_ASSIGNED => 'Intervenant assigné',
            self::STATUS_IN_PROGRESS => 'En cours',
            self::STATUS_COMPLETED => 'Terminée',
            self::STATUS_CANCELLED => 'Annulée',
            default => $this->status,
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'warning',
            self::STATUS_QUOTE_SENT => 'info',
            self::STATUS_QUOTE_ACCEPTED => 'success',
            self::STATUS_QUOTE_REFUSED => 'danger',
            self::STATUS_PAID => 'success',
            self::STATUS_ASSIGNED => 'info',
            self::STATUS_IN_PROGRESS => 'primary',
            self::STATUS_COMPLETED => 'success',
            self::STATUS_CANCELLED => 'danger',
            default => 'secondary',
        };
    }
}
