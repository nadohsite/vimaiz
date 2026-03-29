<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pricing_rules', function (Blueprint $table) {
            $table->decimal('appartement_multiplier', 5, 2)->default(1.00)->after('base_hourly_rate');
        });

        // Set default value for existing rows
        DB::table('pricing_rules')->update([
            'appartement_multiplier' => 1.00,
        ]);
    }

    public function down(): void
    {
        Schema::table('pricing_rules', function (Blueprint $table) {
            $table->dropColumn('appartement_multiplier');
        });
    }
};
