<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('agent_profiles', 'is_banned')) {
                $table->boolean('is_banned')->default(false)->after('suspended_until');
            }
            if (!Schema::hasColumn('agent_profiles', 'banned_at')) {
                $table->timestamp('banned_at')->nullable()->after('is_banned');
            }
            if (!Schema::hasColumn('agent_profiles', 'ban_reason')) {
                $table->text('ban_reason')->nullable()->after('banned_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropColumn(['is_banned', 'banned_at', 'ban_reason']);
        });
    }
};
