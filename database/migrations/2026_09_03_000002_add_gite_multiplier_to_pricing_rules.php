<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pricing_rules', function (Blueprint $table) {
            $table->decimal('gite_multiplier', 5, 2)->default(1.00)->after('chalet_multiplier');
        });

        DB::table('pricing_rules')->update([
            'gite_multiplier' => 1.00,
        ]);
    }

    public function down(): void
    {
        Schema::table('pricing_rules', function (Blueprint $table) {
            $table->dropColumn('gite_multiplier');
        });
    }
};
