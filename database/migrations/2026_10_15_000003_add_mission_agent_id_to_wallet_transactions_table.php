<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Permet de tracer quelle part de quelle brigade correspond à une
 * wallet_transaction (nécessaire pour retrouver, à la libération des 48h,
 * la transaction "pending" exacte à faire passer en "completed").
 *
 * ATTENTION — découverte en préparant cette migration (15/10/2026) :
 * App\Models\WalletTransaction::$fillable contient déjà 'mission_id', et
 * App\Models\Wallet::credit() / App\Services\MissionService la lisent déjà
 * (avec un garde Schema::hasColumn), mais AUCUNE migration de ce dépôt ne
 * crée cette colonne sur `wallet_transactions` — elle a donc probablement
 * été ajoutée à la main sur la base réelle à un moment donné, en dehors de
 * toute migration. On la crée ici de façon idempotente (hasColumn) pour que
 * ce dépôt et la base réelle restent cohérents sur n'importe quel
 * environnement, plutôt que de partir du principe qu'elle existe déjà.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wallet_transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('wallet_transactions', 'mission_id')) {
                $table->foreignId('mission_id')
                    ->nullable()
                    ->after('booking_id')
                    ->constrained()
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('wallet_transactions', 'mission_agent_id')) {
                $table->foreignId('mission_agent_id')
                    ->nullable()
                    ->after('mission_id')
                    ->constrained('mission_agents')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('wallet_transactions', function (Blueprint $table) {
            if (Schema::hasColumn('wallet_transactions', 'mission_agent_id')) {
                $table->dropConstrainedForeignId('mission_agent_id');
            }

            // On ne retire pas mission_id : elle préexistait peut-être à cette
            // migration (voir commentaire ci-dessus) sur certains
            // environnements, un rollback ne doit pas supprimer une colonne
            // dont on n'est pas sûr qu'elle vienne de cette migration.
        });
    }
};
