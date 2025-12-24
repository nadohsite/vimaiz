<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'type',
        'name',
        'address_line1',
        'address_line2',
        'city',
        'postal_code',
        'latitude',
        'longitude',
        'surface_area',
        'bedrooms',
        'bathrooms',
        'toilets',
        'other_rooms',
        'floors',
        'external_surface',
        'access_code',
        'entry_instructions',
        'wifi_code',
        'trash_instructions',
        'checklist',
        'photos',
    ];

    protected $casts = [
        'checklist' => 'array',
        'photos' => 'array',
        'surface_area' => 'decimal:2',
        'external_surface' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
