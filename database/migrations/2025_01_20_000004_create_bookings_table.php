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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_number')->unique();
            
            // Relationships
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->foreignId('address_id')->constrained()->onDelete('cascade');
            
            // Booking Details
            $table->dateTime('scheduled_at');
            $table->integer('duration_minutes');
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            
            // Status
            $table->enum('status', [
                'pending',      // Waiting for agent acceptance
                'confirmed',    // Agent accepted
                'in_progress',  // Agent is working
                'completed',    // Work finished
                'cancelled',    // Cancelled by client or agent
                'rejected'      // Agent rejected
            ])->default('pending');
            
            // Pricing
            $table->decimal('service_price', 8, 2);
            $table->decimal('platform_fee', 8, 2)->default(0);
            $table->decimal('total_price', 8, 2);
            
            // Additional Info
            $table->text('special_instructions')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            
            // Recurrence
            $table->boolean('is_recurring')->default(false);
            $table->foreignId('parent_booking_id')->nullable()->constrained('bookings')->onDelete('set null');
            
            $table->timestamps();
            
            // Indexes
            $table->index('booking_number');
            $table->index('status');
            $table->index('scheduled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
