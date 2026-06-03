<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Schema;

class Wallet extends Model
{
    protected $fillable = [
        'user_id',
        'balance',
        'pending_balance',
        'total_earned',
        'total_withdrawn',
        'currency',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'pending_balance' => 'decimal:2',
        'total_earned' => 'decimal:2',
        'total_withdrawn' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function credit(float $amount, string $description = null, Booking|Mission|null $related = null): WalletTransaction
    {
        $this->balance += $amount;
        $this->total_earned += $amount;
        $this->save();

        $data = [
            'booking_id' => $related instanceof Booking ? $related->id : null,
            'type' => 'credit',
            'amount' => $amount,
            'balance_after' => $this->balance,
            'description' => $description,
            'status' => 'completed',
        ];

        if ($related instanceof Mission && Schema::hasColumn('wallet_transactions', 'mission_id')) {
            $data['mission_id'] = $related->id;
        }

        return $this->transactions()->create($data);
    }

    public function debit(float $amount, string $description = null): WalletTransaction
    {
        if ($this->balance < $amount) {
            throw new \Exception('Insufficient balance');
        }

        $this->balance -= $amount;
        $this->save();

        return $this->transactions()->create([
            'type' => 'debit',
            'amount' => $amount,
            'balance_after' => $this->balance,
            'description' => $description,
            'status' => 'completed',
        ]);
    }

    public function withdraw(float $amount, string $bankAccount = null): WalletTransaction
    {
        if ($this->balance < $amount) {
            throw new \Exception('Insufficient balance');
        }

        $this->balance -= $amount;
        $this->total_withdrawn += $amount;
        $this->save();

        return $this->transactions()->create([
            'type' => 'withdrawal',
            'amount' => $amount,
            'balance_after' => $this->balance,
            'reference' => $bankAccount,
            'description' => 'Withdrawal to bank account',
            'status' => 'pending',
            'metadata' => [
                'bank_account' => $bankAccount,
            ],
        ]);
    }
}
