<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL: drop the existing check constraint and recreate with 'appartement' included
        DB::statement("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_type_check");
        DB::statement("ALTER TABLE properties ADD CONSTRAINT properties_type_check CHECK (type::text = ANY (ARRAY['appartement'::character varying, 'maison'::character varying, 'villa'::character varying, 'chalet'::character varying]::text[]))");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_type_check");
        DB::statement("ALTER TABLE properties ADD CONSTRAINT properties_type_check CHECK (type::text = ANY (ARRAY['maison'::character varying, 'villa'::character varying, 'chalet'::character varying]::text[]))");
    }
};
