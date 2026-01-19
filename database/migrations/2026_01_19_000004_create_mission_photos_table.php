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
        Schema::create('mission_photos', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('mission_id')->constrained()->onDelete('cascade');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            
            // Photo type
            $table->enum('type', ['before', 'after']);
            
            // File info
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type')->default('image/jpeg');
            $table->integer('file_size')->nullable(); // bytes
            
            // Optional description
            $table->text('description')->nullable();
            
            // Geolocation (for verification)
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Timestamp when photo was taken (from EXIF or device)
            $table->timestamp('taken_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['mission_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mission_photos');
    }
};
