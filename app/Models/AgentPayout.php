<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AgentPayout extends Model
{
    use HasFactory;

    protected $fillable = [
        'payout_number',
        'agent_id',
        'period_start',
        'period_end',
        'gross_amount',
        'platform_commission',
        'net_amount',
        'bookings_count',
        'status',
        'payment_method',
        'transfer_id',
        'bank_details',
        'processed_at',
        'failure_reason',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'gross_amount' => 'decimal:2',
        'platform_commission' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payout) {
            if (!$payout->payout_number) {
                $payout->payout_number = 'PO-' . strtoupper(Str::random(10));
            }
        });
    }

    // Relationships
    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
