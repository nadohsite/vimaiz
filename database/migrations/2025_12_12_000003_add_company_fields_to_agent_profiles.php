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
            $table->enum('type', ['individual', 'company'])->default('individual')->after('user_id');
            $table->string('company_name')->nullable()->after('type');
            $table->string('siret')->nullable()->after('company_name');
            $table->string('tva_number')->nullable()->after('siret');
            $table->string('website')->nullable()->after('tva_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropColumn(['type', 'company_name', 'siret', 'tva_number', 'website']);
        });
    }
};
