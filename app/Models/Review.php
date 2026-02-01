<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'mission_id',
        'client_id',
        'agent_id',
        'rating',
        'comment',
        'photos',
        'status',
        'rejection_reason',
        'moderated_at',
        'agent_response',
        'agent_responded_at',
    ];

    protected $casts = [
        'photos' => 'array',
        'moderated_at' => 'datetime',
        'agent_responded_at' => 'datetime',
    ];

    // Relationships
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function mission()
    {
        return $this->belongsTo(Mission::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // Observers
    protected static function boot()
    {
        parent::boot();

        static::created(function ($review) {
            // Update agent's average rating
            $review->agent->agentProfile?->updateRating();
        });

        static::updated(function ($review) {
            // Update agent's average rating when review is modified
            $review->agent->agentProfile?->updateRating();
        });

        static::deleted(function ($review) {
            // Update agent's average rating when review is deleted
            $review->agent->agentProfile?->updateRating();
        });
    }
}
