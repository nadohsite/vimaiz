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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            
            // Relationships
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            
            // Rating & Review
            $table->tinyInteger('rating'); // 1-5 stars
            $table->text('comment')->nullable();
            
            // Photos (optional)
            $table->json('photos')->nullable();
            
            // Moderation
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('moderated_at')->nullable();
            
            // Response from agent
            $table->text('agent_response')->nullable();
            $table->timestamp('agent_responded_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('rating');
            $table->index('status');
            
            // Ensure one review per booking
            $table->unique('booking_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
