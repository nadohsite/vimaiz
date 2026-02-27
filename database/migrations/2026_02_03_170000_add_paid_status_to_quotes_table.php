<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Note: 'paid' status already exists in the original quotes table migration.
     * This migration is kept for compatibility but performs no action.
     */
    public function up(): void
    {
        // 'paid' status already exists in original migration (2026_01_19_000002_create_quotes_table.php)
        // No action needed
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No action needed
    }
};
