<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentSanction extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_profile_id',
        'admin_id',
        'type',
        'reason',
        'suspension_days',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    const TYPE_WARNING = 'warning';
    const TYPE_SUSPENSION = 'suspension';
    const TYPE_BAN = 'ban';
    const TYPE_UNSUSPEND = 'unsuspend';
    const TYPE_UNBAN = 'unban';

    public function agentProfile()
    {
        return $this->belongsTo(AgentProfile::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            self::TYPE_WARNING => 'Avertissement',
            self::TYPE_SUSPENSION => 'Suspension',
            self::TYPE_BAN => 'Exclusion définitive',
            self::TYPE_UNSUSPEND => 'Levée de suspension',
            self::TYPE_UNBAN => 'Réintégration',
            default => $this->type,
        };
    }

    public function getTypeColorAttribute(): string
    {
        return match ($this->type) {
            self::TYPE_WARNING => 'warning',
            self::TYPE_SUSPENSION => 'danger',
            self::TYPE_BAN => 'danger',
            self::TYPE_UNSUSPEND => 'success',
            self::TYPE_UNBAN => 'success',
            default => 'gray',
        };
    }
}
