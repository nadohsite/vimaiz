<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Modifier la colonne type pour inclure 'appartement'
        DB::statement("
            ALTER TABLE properties 
            MODIFY COLUMN type ENUM('appartement','maison','villa','chalet') NOT NULL
        ");
    }

    public function down(): void
    {
        // Revenir à l'ancien ENUM sans 'appartement'
        DB::statement("
            ALTER TABLE properties 
            MODIFY COLUMN type ENUM('maison','villa','chalet') NOT NULL
        ");
    }
};