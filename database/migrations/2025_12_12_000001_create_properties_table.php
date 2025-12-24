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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['maison', 'villa', 'chalet']);
            $table->string('name')->nullable(); // Friendly name for the property
            
            // Address details
            $table->string('address_line1');
            $table->string('address_line2')->nullable();
            $table->string('city');
            $table->string('postal_code');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Property details
            $table->decimal('surface_area', 8, 2); // m2
            $table->integer('bedrooms')->default(0);
            $table->integer('bathrooms')->default(0);
            $table->integer('toilets')->default(0);
            $table->integer('other_rooms')->default(0);
            $table->integer('floors')->default(0); // 0 = plain-pied
            $table->decimal('external_surface', 8, 2)->nullable(); // m2
            
            // Access & Instructions
            $table->string('access_code')->nullable();
            $table->text('entry_instructions')->nullable();
            $table->text('wifi_code')->nullable();
            $table->text('trash_instructions')->nullable();
            
            // Media & Checklist
            $table->json('checklist')->nullable(); // Custom items to check
            $table->json('photos')->nullable(); // Array of image paths

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
