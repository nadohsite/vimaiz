<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // MySQL requires raw SQL to modify ENUM
        DB::statement("ALTER TABLE quotes MODIFY COLUMN status ENUM('draft', 'sent', 'accepted', 'refused', 'expired', 'paid') DEFAULT 'draft'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original ENUM (only if no 'paid' status exists)
        DB::statement("ALTER TABLE quotes MODIFY COLUMN status ENUM('draft', 'sent', 'accepted', 'refused', 'expired') DEFAULT 'draft'");
    }
};
