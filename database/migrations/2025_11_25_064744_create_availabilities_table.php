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
        Schema::create('availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            
            // Recurring availability (weekly schedule)
            $table->integer('day_of_week')->nullable(); // 0 = Sunday, 6 = Saturday
            $table->time('start_time');
            $table->time('end_time');
            
            // Specific date override (for holidays, special dates)
            $table->date('specific_date')->nullable();
            
            // Availability status
            $table->boolean('is_available')->default(true);
            
            $table->timestamps();
            
            // Indexes
            $table->index(['agent_id', 'day_of_week']);
            $table->index(['agent_id', 'specific_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('availabilities');
    }
};
