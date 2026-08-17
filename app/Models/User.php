<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
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
            'last_reminder_sent_at' => 'datetime',
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
        return $this->hasOne(AgentProfile::class, 'user_id');
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function clientBookings()
    {
        return $this->hasMany(Booking::class, 'client_id');
    }

    public function agentBookings()
    {
        return $this->hasMany(Booking::class, 'agent_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'client_id');
    }

    public function receivedReviews()
    {
        return $this->hasMany(Review::class, 'agent_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function payouts()
    {
        return $this->hasMany(AgentPayout::class, 'agent_id');
    }

    public function clientConversations()
    {
        return $this->hasMany(Conversation::class, 'client_id');
    }

    public function agentConversations()
    {
        return $this->hasMany(Conversation::class, 'agent_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function properties()
    {
        return $this->hasMany(Property::class);
    }

    public function serviceRequests()
    {
        return $this->hasMany(ServiceRequest::class, 'client_id');
    }

    public function clientMissions()
    {
        return $this->hasMany(Mission::class, 'client_id');
    }

    public function agentMissions()
    {
        return $this->hasMany(Mission::class, 'agent_id');
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function getFullNameAttribute(): string
    {
        if ($this->first_name && $this->last_name) {
            return $this->first_name.' '.$this->last_name;
        }

        return $this->name ?? '';
    }

    /**
     * Prénom pour les salutations (emails, dashboard).
     */
    public function preferredFirstName(): string
    {
        if (! empty($this->first_name)) {
            return $this->first_name;
        }

        if (! empty($this->name)) {
            return explode(' ', trim($this->name))[0];
        }

        return '';
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

    public static function notifyAdmins(Notification $notification): void
    {
        static::admins()->get()->each(
            fn (self $admin) => $admin->notify($notification)
        );
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Determine if the user can access the Filament admin panel.
     * Only admins are allowed.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->isAdmin();
    }

    public function receivesBroadcastNotificationsOn(): string
    {
        return 'user.'.$this->id;
    }
}
