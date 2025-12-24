<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'role',
        'phone',
        'phone_verified_at',
        'avatar',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    // Role Helper Methods
    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    public function isAgent(): bool
    {
        return $this->role === 'agent';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    // Relationships
    public function agentProfile()
    {
        return $this->hasOne(\App\Models\AgentProfile::class, 'user_id');
    }

    public function addresses()
    {
        return $this->hasMany(\App\Models\Address::class);
    }

    public function clientBookings()
    {
        return $this->hasMany(\App\Models\Booking::class, 'client_id');
    }

    public function agentBookings()
    {
        return $this->hasMany(\App\Models\Booking::class, 'agent_id');
    }

    public function reviews()
    {
        return $this->hasMany(\App\Models\Review::class, 'client_id');
    }

    public function receivedReviews()
    {
        return $this->hasMany(\App\Models\Review::class, 'agent_id');
    }

    public function transactions()
    {
        return $this->hasMany(\App\Models\Transaction::class);
    }

    public function payouts()
    {
        return $this->hasMany(\App\Models\AgentPayout::class, 'agent_id');
    }

    public function clientConversations()
    {
        return $this->hasMany(\App\Models\Conversation::class, 'client_id');
    }

    public function agentConversations()
    {
        return $this->hasMany(\App\Models\Conversation::class, 'agent_id');
    }

    public function messages()
    {
        return $this->hasMany(\App\Models\Message::class, 'sender_id');
    }

    public function properties()
    {
        return $this->hasMany(\App\Models\Property::class);
    }

    // Scopes
    public function scopeClients($query)
    {
        return $query->where('role', 'client');
    }

    public function scopeAgents($query)
    {
        return $query->where('role', 'agent');
    }

    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
