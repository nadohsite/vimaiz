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
        Schema::create('agent_payouts', function (Blueprint $table) {
            $table->id();
            $table->string('payout_number')->unique();
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            
            // Period
            $table->date('period_start');
            $table->date('period_end');
            
            // Amounts
            $table->decimal('gross_amount', 10, 2); // Total earnings
            $table->decimal('platform_commission', 10, 2); // Platform fee
            $table->decimal('net_amount', 10, 2); // Amount to pay
            
            // Payout Details
            $table->integer('bookings_count')->default(0);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            
            // Payment Info
            $table->string('payment_method')->nullable(); // bank_transfer, stripe_connect
            $table->string('transfer_id')->nullable(); // Stripe Transfer ID
            $table->text('bank_details')->nullable();
            
            $table->timestamp('processed_at')->nullable();
            $table->text('failure_reason')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('payout_number');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_payouts');
    }
};
