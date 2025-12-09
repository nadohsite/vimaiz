<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingRecurrence extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'frequency',
        'days_of_week',
        'day_of_month',
        'preferred_time',
        'start_date',
        'end_date',
        'is_active',
        'next_occurrence',
    ];

    protected $casts = [
        'days_of_week' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'next_occurrence' => 'date',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
