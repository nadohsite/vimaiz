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
        // Step 1: Drop foreign key and unique constraint on booking_id
        Schema::table('reviews', function (Blueprint $table) {
            // First drop the foreign key constraint
            $table->dropForeign(['booking_id']);
            
            // Then drop the unique constraint
            $table->dropUnique(['booking_id']);
        });

        // Step 2: Add mission_id and modify booking_id
        Schema::table('reviews', function (Blueprint $table) {
            // Add mission_id column with foreign key
            $table->foreignId('mission_id')->nullable()->after('booking_id')->constrained()->onDelete('cascade');
            
            // Make booking_id nullable
            $table->unsignedBigInteger('booking_id')->nullable()->change();
            
            // Re-add foreign key on booking_id (without unique constraint)
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            
            // Add unique constraint for mission_id
            $table->unique('mission_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Step 1: Remove mission_id and foreign key on booking_id
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique(['mission_id']);
            $table->dropForeign(['mission_id']);
            $table->dropColumn('mission_id');
            $table->dropForeign(['booking_id']);
        });

        // Step 2: Restore original booking_id with unique constraint
        Schema::table('reviews', function (Blueprint $table) {
            $table->unsignedBigInteger('booking_id')->nullable(false)->change();
            $table->unique('booking_id');
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
        });
    }
};
