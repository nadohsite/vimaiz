<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MissionPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'mission_id',
        'uploaded_by',
        'type',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'description',
        'latitude',
        'longitude',
        'taken_at',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'taken_at' => 'datetime',
    ];

    const TYPE_BEFORE = 'before';
    const TYPE_AFTER = 'after';

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }

    public function getFileSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size;
        
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        
        return $bytes . ' bytes';
    }

    public function isBefore(): bool
    {
        return $this->type === self::TYPE_BEFORE;
    }

    public function isAfter(): bool
    {
        return $this->type === self::TYPE_AFTER;
    }

    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            self::TYPE_BEFORE => 'Avant',
            self::TYPE_AFTER => 'Après',
            default => $this->type,
        };
    }
}
