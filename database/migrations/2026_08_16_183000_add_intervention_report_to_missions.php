<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('missions', function (Blueprint $table) {
            $table->boolean('report_nothing_to_report')->nullable()->after('checklist');
            $table->timestamp('report_submitted_at')->nullable()->after('report_nothing_to_report');
            $table->unsignedInteger('actual_duration_minutes')->nullable()->after('completed_at');
        });

        Schema::create('mission_anomalies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('category', 50);
            $table->string('category_label', 100);
            $table->string('type', 80);
            $table->string('label');
            $table->text('notes')->nullable();
            $table->boolean('suggests_follow_up')->default(false);
            $table->foreignId('follow_up_service_request_id')->nullable()->constrained('service_requests')->nullOnDelete();
            $table->timestamps();

            $table->index(['agent_id', 'created_at']);
            $table->index(['property_id', 'created_at']);
            $table->index(['category', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_anomalies');

        Schema::table('missions', function (Blueprint $table) {
            $table->dropColumn([
                'report_nothing_to_report',
                'report_submitted_at',
                'actual_duration_minutes',
            ]);
        });
    }
};
