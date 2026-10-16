<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Brigades multi-agents (cahier des charges "grands espaces", Volets 6-7,
 * octobre 2026). Cette table porte la vraie liste d'intervenants d'une
 * mission ; `missions.agent_id` reste l'agent "référent" (le premier à avoir
 * accepté) pour ne pas casser tout le code existant qui ne connaît qu'un
 * seul agent par mission (photos, policies, scoring, Filament...).
 *
 * Pour une mission mono-agent (missions.required_agents = 1, le cas de tout
 * le parc actuel sous 200 m²), il n'y a qu'une seule ligne ici et le
 * comportement reste identique à avant cette migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mission_agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mission_id')->constrained()->onDelete('cascade');
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');

            // Agent référent de la brigade (= missions.agent_id), pour compat.
            $table->boolean('is_lead')->default(false);

            $table->enum('status', [
                'pending_agent', // proposé, en attente de réponse
                'accepted',      // a accepté son créneau dans la brigade
                'refused',       // a refusé ou s'est désisté
                'arrived',       // arrivée géolocalisée confirmée
                'in_progress',   // intervention en cours pour cet agent
                'completed',     // mission clôturée, part de paiement calculée
            ])->default('pending_agent');

            $table->timestamp('notified_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->string('refusal_reason')->nullable();

            // Arrivée géolocalisée individuelle (même règle que
            // MissionService::startMission(), mais par agent de la brigade).
            $table->timestamp('arrived_at')->nullable();
            $table->decimal('arrival_latitude', 10, 8)->nullable();
            $table->decimal('arrival_longitude', 11, 8)->nullable();

            // Part de paiement : calculée à la clôture, sur le nombre
            // d'agents réellement présents (décision utilisateur du
            // 15/10/2026) — donc nullable jusqu'à la clôture, pas figée au
            // devis.
            $table->decimal('payout_share', 10, 2)->nullable();
            $table->enum('payout_status', ['held', 'released', 'cancelled'])->default('held');
            $table->timestamp('payout_released_at')->nullable();

            $table->timestamps();

            $table->unique(['mission_id', 'agent_id']);
            $table->index(['agent_id', 'status']);
            $table->index(['mission_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_agents');
    }
};
