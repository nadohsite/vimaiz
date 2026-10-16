<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Brigades multi-agents + paiement différé 48h (cahier des charges "grands
 * espaces", Volets 6-7, octobre 2026).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('missions', function (Blueprint $table) {
            // Nombre d'intervenants nécessaires, calculé une fois au devis :
            // max(2, ceil(surface / 125)) pour les biens >= 200 m², sinon 1
            // (parc existant conservé, décision du 14/10/2026).
            $table->unsignedTinyInteger('required_agents')->default(1)->after('agent_id');

            // Dénormalisé pour éviter un COUNT(mission_agents) à chaque lecture.
            $table->unsignedTinyInteger('accepted_agents_count')->default(0)->after('required_agents');

            // Validation explicite du client avant l'échéance des 48h
            // (débloque le paiement immédiatement sans attendre le job
            // planifié vimaiz:release-held-mission-payouts).
            $table->timestamp('client_validated_at')->nullable()->after('completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('missions', function (Blueprint $table) {
            $table->dropColumn(['required_agents', 'accepted_agents_count', 'client_validated_at']);
        });
    }
};
