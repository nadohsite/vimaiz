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
        Schema::table('properties', function (Blueprint $table) {
            // Add additional_info field if not exists
            if (!Schema::hasColumn('properties', 'additional_info')) {
                $table->text('additional_info')->nullable()->after('trash_instructions');
            }
            
            // Add is_active status
            if (!Schema::hasColumn('properties', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('photos');
            }
            
            // Add indexes on city for geographic filtering (if not exists)
            // Note: PostgreSQL will fail if indexes already exist, so we skip them here
            // Indexes may have been created by previous migrations
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            if (Schema::hasColumn('properties', 'additional_info')) {
                $table->dropColumn('additional_info');
            }
            if (Schema::hasColumn('properties', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};
