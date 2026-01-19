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
        Schema::create('missions', function (Blueprint $table) {
            $table->id();
            $table->string('mission_number')->unique();
            
            // Relations
            $table->foreignId('service_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('quote_id')->constrained()->onDelete('cascade');
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            
            // Scheduling
            $table->dateTime('scheduled_at');
            $table->integer('duration_hours');
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            
            // Pricing
            $table->decimal('total_price', 10, 2);
            $table->decimal('agent_payout', 10, 2);
            $table->decimal('platform_fee', 10, 2);
            
            // Status
            $table->enum('status', [
                'pending_agent',    // En attente réponse agent
                'agent_accepted',   // Agent a accepté
                'agent_refused',    // Agent a refusé (réattribution nécessaire)
                'in_progress',      // Mission en cours
                'photos_before',    // Photos avant uploadées
                'photos_after',     // Photos après uploadées
                'completed',        // Terminée
                'cancelled'         // Annulée
            ])->default('pending_agent');
            
            // Payment
            $table->enum('payment_status', [
                'pending',
                'paid',
                'refunded'
            ])->default('pending');
            $table->string('payment_intent_id')->nullable();
            $table->timestamp('paid_at')->nullable();
            
            // Quality control (internal)
            $table->integer('internal_quality_score')->nullable(); // 1-5
            $table->text('internal_quality_notes')->nullable();
            $table->foreignId('quality_reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('quality_reviewed_at')->nullable();
            
            // Cancellation
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            
            // Agent response tracking
            $table->timestamp('agent_notified_at')->nullable();
            $table->timestamp('agent_responded_at')->nullable();
            $table->integer('assignment_attempts')->default(0);
            
            $table->timestamps();
            
            // Indexes
            $table->index(['agent_id', 'status']);
            $table->index(['client_id', 'status']);
            $table->index('status');
            $table->index('scheduled_at');
            $table->index('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('missions');
    }
};
