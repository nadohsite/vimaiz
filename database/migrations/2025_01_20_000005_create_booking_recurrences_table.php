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
        Schema::create('booking_recurrences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            
            $table->enum('frequency', ['weekly', 'biweekly', 'monthly']);
            $table->json('days_of_week')->nullable(); // For weekly: [1,3,5] = Monday, Wednesday, Friday
            $table->integer('day_of_month')->nullable(); // For monthly: 15 = 15th of each month
            $table->time('preferred_time');
            
            $table->date('start_date');
            $table->date('end_date')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->date('next_occurrence')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_recurrences');
    }
};
