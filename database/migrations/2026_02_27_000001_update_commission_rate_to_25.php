<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update commission rate to 25% for all pricing rules
        DB::table('pricing_rules')->update([
            'platform_commission_rate' => 25.00,
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to 20%
        DB::table('pricing_rules')->update([
            'platform_commission_rate' => 20.00,
            'updated_at' => now(),
        ]);
    }
};
