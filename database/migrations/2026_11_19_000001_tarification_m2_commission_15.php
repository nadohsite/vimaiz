<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Brief « Estimateur » (novembre 2026) :
     * - commission Vimaiz ramenée à 15 % (85 % reversés à l'équipe) ;
     * - les demandes conservent les espaces annexes et les options choisis
     *   par le propriétaire (surface totale cumulée + équipements).
     *
     * Les devis existants gardent leur taux : seuls les nouveaux devis
     * partent à 15 %.
     */
    public function up(): void
    {
        DB::table('pricing_rules')->update([
            'platform_commission_rate' => 15.00,
            'updated_at' => now(),
        ]);

        Schema::table('service_requests', function (Blueprint $table) {
            if (! Schema::hasColumn('service_requests', 'annexes')) {
                $table->json('annexes')->nullable()->after('requested_hours');
            }
            if (! Schema::hasColumn('service_requests', 'options')) {
                $table->json('options')->nullable()->after('annexes');
            }
        });
    }

    public function down(): void
    {
        DB::table('pricing_rules')->update([
            'platform_commission_rate' => 25.00,
            'updated_at' => now(),
        ]);

        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropColumn(['annexes', 'options']);
        });
    }
};
