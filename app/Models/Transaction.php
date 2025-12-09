<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_number',
        'booking_id',
        'user_id',
        'type',
        'amount',
        'currency',
        'payment_method',
        'payment_intent_id',
        'charge_id',
        'status',
        'metadata',
        'failure_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (!$transaction->transaction_number) {
                $transaction->transaction_number = 'TXN-' . strtoupper(Str::random(12));
            }
        });
    }

    // Relationships
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePayments($query)
    {
        return $query->where('type', 'payment');
    }

    public function scopePayouts($query)
    {
        return $query->where('type', 'payout');
    }
}
