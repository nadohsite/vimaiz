<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'mobile_money_provider',
                'mobile_money_phone',
                'mobile_money_account_name',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->string('mobile_money_provider')->nullable()->after('bic');
            $table->string('mobile_money_phone', 30)->nullable()->after('mobile_money_provider');
            $table->string('mobile_money_account_name', 100)->nullable()->after('mobile_money_phone');
        });
    }
};
