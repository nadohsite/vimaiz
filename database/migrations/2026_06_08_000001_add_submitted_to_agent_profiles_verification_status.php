<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE agent_profiles
            MODIFY COLUMN verification_status
            ENUM('pending', 'submitted', 'verified', 'rejected')
            NOT NULL DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        DB::table('agent_profiles')
            ->where('verification_status', 'submitted')
            ->update(['verification_status' => 'pending']);

        DB::statement("
            ALTER TABLE agent_profiles
            MODIFY COLUMN verification_status
            ENUM('pending', 'verified', 'rejected')
            NOT NULL DEFAULT 'pending'
        ");
    }
};
