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
        Schema::table('reviews', function (Blueprint $table) {
            $table->foreignId('mission_id')->nullable()->after('booking_id')->constrained()->onDelete('cascade');
            
            // Make booking_id nullable since we can have mission-based reviews
            $table->foreignId('booking_id')->nullable()->change();
            
            // Drop the unique constraint on booking_id
            $table->dropUnique(['booking_id']);
            
            // Add unique constraint for mission_id
            $table->unique('mission_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique(['mission_id']);
            $table->dropForeign(['mission_id']);
            $table->dropColumn('mission_id');
            $table->unique('booking_id');
        });
    }
};
