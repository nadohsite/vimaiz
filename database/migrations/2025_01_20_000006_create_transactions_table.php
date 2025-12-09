<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique();
            
            // Relationships
            $table->foreignId('booking_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Transaction Details
            $table->enum('type', ['payment', 'refund', 'payout', 'commission']);
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('MAD');
            
            // Payment Gateway
            $table->string('payment_method')->nullable(); // stripe, paypal, cash
            $table->string('payment_intent_id')->nullable(); // Stripe Payment Intent ID
            $table->string('charge_id')->nullable(); // Stripe Charge ID
            
            // Status
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded'])->default('pending');
            
            // Metadata
            $table->json('metadata')->nullable();
            $table->text('failure_reason')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('transaction_number');
            $table->index('status');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
