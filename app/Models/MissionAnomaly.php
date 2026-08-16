<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MissionAnomaly extends Model
{
    protected $fillable = [
        'mission_id',
        'property_id',
        'agent_id',
        'category',
        'category_label',
        'type',
        'label',
        'notes',
        'suggests_follow_up',
        'follow_up_service_request_id',
    ];

    protected $casts = [
        'suggests_follow_up' => 'boolean',
    ];

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function followUpServiceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class, 'follow_up_service_request_id');
    }

    public function hasFollowUp(): bool
    {
        return $this->follow_up_service_request_id !== null;
    }
}
