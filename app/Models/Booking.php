<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_number',
        'client_id',
        'agent_id',
        'service_id',
        'address_id',
        'scheduled_at',
        'duration_minutes',
        'started_at',
        'completed_at',
        'status',
        'service_price',
        'platform_fee',
        'total_price',
        'special_instructions',
        'cancellation_reason',
        'cancelled_at',
        'is_recurring',
        'parent_booking_id',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'service_price' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'total_price' => 'decimal:2',
        'is_recurring' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (!$booking->booking_number) {
                $booking->booking_number = 'BK-' . strtoupper(Str::random(10));
            }
        });
    }

    // Relationships
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function recurrence()
    {
        return $this->hasOne(BookingRecurrence::class);
    }

    public function parentBooking()
    {
        return $this->belongsTo(Booking::class, 'parent_booking_id');
    }

    public function childBookings()
    {
        return $this->hasMany(Booking::class, 'parent_booking_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeUpcoming($query)
    {
        return $query->whereIn('status', ['pending', 'confirmed'])
            ->where('scheduled_at', '>', now());
    }

    // Helpers
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']) &&
            $this->scheduled_at > now();
    }

    public function canBeReviewed(): bool
    {
        return $this->status === 'completed' && !$this->review;
    }
}
