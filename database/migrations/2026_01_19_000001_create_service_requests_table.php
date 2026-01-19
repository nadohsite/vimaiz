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
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            
            // Relations
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            
            // Scheduling
            $table->date('scheduled_date');
            $table->time('scheduled_time');
            $table->integer('requested_hours');
            
            // Details
            $table->text('special_instructions')->nullable();
            
            // Status workflow
            $table->enum('status', [
                'pending',          // En attente de devis
                'quote_sent',       // Devis envoyé
                'quote_accepted',   // Devis accepté
                'quote_refused',    // Devis refusé
                'paid',             // Payé, en attente attribution
                'assigned',         // Agent attribué
                'in_progress',      // Mission en cours
                'completed',        // Terminée
                'cancelled'         // Annulée
            ])->default('pending');
            
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['client_id', 'status']);
            $table->index('scheduled_date');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_requests');
    }
};
