<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->string('bank_account_holder')->nullable()->after('company_name');
            $table->string('iban', 34)->nullable()->after('bank_account_holder');
            $table->string('bic', 11)->nullable()->after('iban');
        });
    }

    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropColumn(['bank_account_holder', 'iban', 'bic']);
        });
    }
};
