<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'user_id',
        'mission_id',
        'quote_id',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'total',
        'status',
        'payment_method',
        'payment_intent_id',
        'billing_name',
        'billing_address',
        'billing_email',
        'description',
        'line_items',
        'issued_at',
        'paid_at',
        'due_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'line_items' => 'array',
        'issued_at' => 'datetime',
        'paid_at' => 'datetime',
        'due_at' => 'datetime',
    ];

    const STATUS_DRAFT = 'draft';
    const STATUS_PENDING = 'pending';
    const STATUS_PAID = 'paid';
    const STATUS_REFUNDED = 'refunded';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invoice) {
            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = static::generateInvoiceNumber();
            }
        });
    }

    public static function generateInvoiceNumber(): string
    {
        $prefix = 'VIM';
        $year = date('Y');
        $month = date('m');
        
        $lastInvoice = static::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastInvoice) {
            $lastNumber = (int) substr($lastInvoice->invoice_number, -5);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf('%s-%s%s-%05d', $prefix, $year, $month, $newNumber);
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mission()
    {
        return $this->belongsTo(Mission::class);
    }

    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }

    // Scopes
    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Helpers
    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    public function getFormattedTotalAttribute(): string
    {
        return number_format($this->total, 2, ',', ' ') . ' €';
    }

    public static function createFromMission(Mission $mission): self
    {
        $subtotal = round($mission->total_price / 1.20, 2); // Remove TVA
        $taxAmount = round($mission->total_price - $subtotal, 2);

        $property = $mission->property;
        $user = $mission->client;

        return static::create([
            'user_id' => $mission->client_id,
            'mission_id' => $mission->id,
            'quote_id' => $mission->quote_id,
            'subtotal' => $subtotal,
            'tax_rate' => 20.00,
            'tax_amount' => $taxAmount,
            'total' => $mission->total_price,
            'status' => self::STATUS_PAID,
            'payment_method' => 'stripe',
            'payment_intent_id' => $mission->payment_intent_id,
            'billing_name' => $user->name,
            'billing_email' => $user->email,
            'description' => 'Prestation de ménage - ' . ($property->name ?? $property->type_label),
            'line_items' => [
                [
                    'description' => 'Ménage ' . ($property->name ?? $property->type_label),
                    'quantity' => $mission->duration_hours,
                    'unit' => 'heure(s)',
                    'unit_price' => round($subtotal / $mission->duration_hours, 2),
                    'total' => $subtotal,
                ],
            ],
            'issued_at' => now(),
            'paid_at' => $mission->paid_at,
        ]);
    }
}
