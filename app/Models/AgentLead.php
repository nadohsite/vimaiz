<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentLead extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'city',
        'experience',
        'status',
        'contacted_at',
        'notes',
    ];

    protected $casts = [
        'contacted_at' => 'datetime',
    ];

    const STATUS_NEW = 'new';
    const STATUS_CONTACTED = 'contacted';
    const STATUS_CONVERTED = 'converted';
    const STATUS_REJECTED = 'rejected';

    protected $attributes = [
        'status' => self::STATUS_NEW,
    ];

    public function scopeNew($query)
    {
        return $query->where('status', self::STATUS_NEW);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', [self::STATUS_NEW, self::STATUS_CONTACTED]);
    }
}
