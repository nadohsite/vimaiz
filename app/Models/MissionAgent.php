<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une ligne = un intervenant assigné (ou proposé) à une mission "brigade".
 * Voir database/migrations/2026_10_15_000001_create_mission_agents_table.php
 * et le plan technique dans le projet Claude Vimaiz pour le contexte complet.
 */
class MissionAgent extends Model
{
    protected $fillable = [
        'mission_id',
        'agent_id',
        'is_lead',
        'status',
        'notified_at',
        'responded_at',
        'refusal_reason',
        'arrived_at',
        'arrival_latitude',
        'arrival_longitude',
        'payout_share',
        'payout_status',
        'payout_released_at',
    ];

    protected $casts = [
        'is_lead' => 'boolean',
        'notified_at' => 'datetime',
        'responded_at' => 'datetime',
        'arrived_at' => 'datetime',
        'arrival_latitude' => 'decimal:8',
        'arrival_longitude' => 'decimal:8',
        'payout_share' => 'decimal:2',
        'payout_released_at' => 'datetime',
    ];

    const STATUS_PENDING_AGENT = 'pending_agent';

    const STATUS_ACCEPTED = 'accepted';

    const STATUS_REFUSED = 'refused';

    const STATUS_ARRIVED = 'arrived';

    const STATUS_IN_PROGRESS = 'in_progress';

    const STATUS_COMPLETED = 'completed';

    // Statuts "actifs" : l'agent fait toujours partie de la brigade pour
    // cette mission (n'a pas refusé/été écarté).
    const ACTIVE_STATUSES = [
        self::STATUS_PENDING_AGENT,
        self::STATUS_ACCEPTED,
        self::STATUS_ARRIVED,
        self::STATUS_IN_PROGRESS,
        self::STATUS_COMPLETED,
    ];

    // Statuts comptant comme "réellement présent" pour la répartition du
    // paiement à la clôture (décision utilisateur du 15/10/2026).
    const ROSTER_STATUSES = [
        self::STATUS_ACCEPTED,
        self::STATUS_ARRIVED,
        self::STATUS_IN_PROGRESS,
    ];

    const PAYOUT_HELD = 'held';

    const PAYOUT_RELEASED = 'released';

    const PAYOUT_CANCELLED = 'cancelled';

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}
