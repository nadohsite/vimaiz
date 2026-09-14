<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->string('stripe_account_id')->nullable()->after('bic');
            $table->boolean('stripe_payouts_enabled')->default(false)->after('stripe_account_id');
            $table->string('stripe_onboarding_status')->default('not_started')->after('stripe_payouts_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropColumn(['stripe_account_id', 'stripe_payouts_enabled', 'stripe_onboarding_status']);
        });
    }
};
