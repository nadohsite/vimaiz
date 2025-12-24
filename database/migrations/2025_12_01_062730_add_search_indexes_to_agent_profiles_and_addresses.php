<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            Schema::table('agent_profiles', function (Blueprint $table) {
                $table->index('hourly_rate');
                $table->index('average_rating');
                $table->index('experience_years');
                $table->index('is_available');
                $table->index('verification_status');
            });
        } catch (\Exception $e) {
            // Index might already exist
        }

        try {
            Schema::table('addresses', function (Blueprint $table) {
                $table->index(['latitude', 'longitude']);
                $table->index('city');
            });
        } catch (\Exception $e) {
            // Index might already exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropIndex(['hourly_rate']);
            $table->dropIndex(['average_rating']);
            $table->dropIndex(['experience_years']);
            $table->dropIndex(['is_available']);
            $table->dropIndex(['verification_status']);
        });

        Schema::table('addresses', function (Blueprint $table) {
            $table->dropIndex(['latitude', 'longitude']);
            $table->dropIndex(['city']);
        });
    }
};
