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
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('quote_number')->unique();
            
            // Relation to service request (1-to-1)
            $table->foreignId('service_request_id')->unique()->constrained()->onDelete('cascade');
            
            // Pricing
            $table->decimal('estimated_price', 10, 2); // Calculé automatiquement
            $table->decimal('final_price', 10, 2)->nullable(); // Ajusté par admin
            $table->decimal('commission_rate', 5, 2)->default(20.00); // % commission VIMAIZ
            $table->decimal('commission_amount', 10, 2)->nullable();
            $table->decimal('agent_amount', 10, 2)->nullable(); // Montant pour l'agent
            
            // Admin notes (internal only)
            $table->text('admin_notes')->nullable();
            $table->text('price_adjustment_reason')->nullable();
            
            // Status
            $table->enum('status', [
                'draft',        // Brouillon
                'sent',         // Envoyé au client
                'accepted',     // Accepté par le client
                'refused',      // Refusé par le client
                'expired',      // Expiré
                'paid'          // Payé
            ])->default('draft');
            
            // Admin who validated
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Timestamps
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('status');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
