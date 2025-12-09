<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Availability extends Model
{
    protected $fillable = [
        'agent_id',
        'day_of_week',
        'start_time',
        'end_time',
        'specific_date',
        'is_available',
    ];

    protected $casts = [
        'specific_date' => 'date',
        'is_available' => 'boolean',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}
