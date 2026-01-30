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
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->boolean('rcp_clause_accepted')->default(false)->after('verification_status');
            $table->timestamp('rcp_clause_accepted_at')->nullable()->after('rcp_clause_accepted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropColumn(['rcp_clause_accepted', 'rcp_clause_accepted_at']);
        });
    }
};
