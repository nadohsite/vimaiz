<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_sanctions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_profile_id')->constrained()->onDelete('cascade');
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null');
            
            $table->enum('type', ['warning', 'suspension', 'ban', 'unsuspend', 'unban']);
            $table->text('reason');
            
            $table->integer('suspension_days')->nullable();
            $table->timestamp('expires_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['agent_profile_id', 'type']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_sanctions');
    }
};
