<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->json('supported_property_types')->nullable()->after('description');
            $table->integer('max_surface_area')->nullable()->after('supported_property_types');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropColumn(['supported_property_types', 'max_surface_area']);
        });
    }
};
