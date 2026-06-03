<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('wallet_transactions', 'mission_id')) {
            Schema::table('wallet_transactions', function (Blueprint $table) {
                $table->foreignId('mission_id')
                    ->nullable()
                    ->after('booking_id')
                    ->constrained()
                    ->onDelete('set null');
            });

            return;
        }

        $hasForeignKey = collect(DB::select(
            'SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
             AND TABLE_NAME = ?
             AND COLUMN_NAME = ?
             AND REFERENCED_TABLE_NAME IS NOT NULL',
            ['wallet_transactions', 'mission_id'],
        ))->isNotEmpty();

        if (! $hasForeignKey) {
            Schema::table('wallet_transactions', function (Blueprint $table) {
                $table->foreign('mission_id')
                    ->references('id')
                    ->on('missions')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('wallet_transactions', 'mission_id')) {
            return;
        }

        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->dropForeign(['mission_id']);
            $table->dropColumn('mission_id');
        });
    }
};
