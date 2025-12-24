<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'company_name',
        'siret',
        'tva_number',
        'website',
        'description',
        'experience_years',
        'hourly_rate',
        'service_radius_km',
        'id_document',
        'address_proof',
        'profile_photo',
        'verification_status',
        'rejection_reason',
        'verified_at',
        'average_rating',
        'total_reviews',
        'total_bookings',
        'is_available',
        'supported_property_types',
        'max_surface_area',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'hourly_rate' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'is_available' => 'boolean',
        'supported_property_types' => 'array',
        'max_surface_area' => 'integer',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function services()
    {
        return $this->belongsToMany(Service::class, 'agent_services')
            ->withPivot('custom_price')
            ->withTimestamps();
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'agent_id', 'user_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'agent_id', 'user_id');
    }

    public function payouts()
    {
        return $this->hasMany(AgentPayout::class, 'agent_id', 'user_id');
    }

    public function availabilities()
    {
        return $this->hasMany(Availability::class);
    }

    // Scopes
    public function scopeIndividuals($query)
    {
        return $query->where('type', 'individual');
    }

    public function scopeCompanies($query)
    {
        return $query->where('type', 'company');
    }

    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }

    public function scopePending($query)
    {
        return $query->where('verification_status', 'pending');
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    // Helpers
    public function isVerified(): bool
    {
        return $this->verification_status === 'verified';
    }

    public function updateRating()
    {
        $this->average_rating = $this->reviews()->avg('rating') ?? 0;
        $this->total_reviews = $this->reviews()->count();
        $this->save();
    }
}
