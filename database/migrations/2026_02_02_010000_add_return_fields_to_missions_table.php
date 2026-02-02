<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('missions', function (Blueprint $table) {
            // Retour en cas de mécontentement client
            $table->boolean('return_requested')->default(false)->after('completed_at');
            $table->string('return_status')->nullable()->after('return_requested'); // pending, in_progress, completed, validated, rejected
            $table->text('return_reason')->nullable()->after('return_status');
            $table->timestamp('return_requested_at')->nullable()->after('return_reason');
            $table->timestamp('return_started_at')->nullable()->after('return_requested_at');
            $table->timestamp('return_completed_at')->nullable()->after('return_started_at');
            $table->timestamp('return_validated_at')->nullable()->after('return_completed_at');
            $table->text('return_agent_notes')->nullable()->after('return_validated_at');
            $table->text('return_client_feedback')->nullable()->after('return_agent_notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('missions', function (Blueprint $table) {
            $table->dropColumn([
                'return_requested',
                'return_status',
                'return_reason',
                'return_requested_at',
                'return_started_at',
                'return_completed_at',
                'return_validated_at',
                'return_agent_notes',
                'return_client_feedback',
            ]);
        });
    }
};
