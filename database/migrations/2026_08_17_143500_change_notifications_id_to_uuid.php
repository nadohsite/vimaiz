<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        if (! Schema::hasTable('notifications')) {
            return;
        }

        $column = collect(DB::select('SHOW COLUMNS FROM notifications WHERE Field = ?', ['id']))->first();
        $type = strtolower((string) ($column->Type ?? ''));

        if (str_contains($type, 'char') || str_contains($type, 'varchar') || str_contains($type, 'uuid')) {
            return;
        }

        DB::statement('ALTER TABLE notifications MODIFY id CHAR(36) NOT NULL');
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::table('notifications')->truncate();
        DB::statement('ALTER TABLE notifications MODIFY id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT');
    }
};
