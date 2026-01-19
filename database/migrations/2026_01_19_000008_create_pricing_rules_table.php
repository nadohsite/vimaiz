<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pricing_rules', function (Blueprint $table) {
            $table->id();
            
            // Base pricing
            $table->decimal('base_hourly_rate', 8, 2)->default(25.00);
            
            // Property type multipliers
            $table->decimal('maison_multiplier', 5, 2)->default(1.00);
            $table->decimal('villa_multiplier', 5, 2)->default(1.20);
            $table->decimal('chalet_multiplier', 5, 2)->default(1.30);
            
            // Surface pricing (additional per m2 above threshold)
            $table->integer('surface_threshold_m2')->default(100);
            $table->decimal('surface_extra_rate', 8, 2)->default(0.10); // per m2 above threshold
            
            // Time-based adjustments
            $table->decimal('weekend_multiplier', 5, 2)->default(1.15);
            $table->decimal('holiday_multiplier', 5, 2)->default(1.25);
            $table->decimal('early_morning_multiplier', 5, 2)->default(1.10); // before 8am
            $table->decimal('evening_multiplier', 5, 2)->default(1.10); // after 6pm
            
            // Zone-based adjustments (by postal code prefix)
            $table->json('zone_multipliers')->nullable(); // {"75": 1.2, "92": 1.15}
            
            // Minimum booking
            $table->integer('minimum_hours')->default(2);
            $table->decimal('minimum_price', 8, 2)->default(50.00);
            
            // Commission
            $table->decimal('platform_commission_rate', 5, 2)->default(20.00); // %
            
            // Active status
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
        });
        
        // Insert default pricing rule
        \DB::table('pricing_rules')->insert([
            'base_hourly_rate' => 25.00,
            'maison_multiplier' => 1.00,
            'villa_multiplier' => 1.20,
            'chalet_multiplier' => 1.30,
            'surface_threshold_m2' => 100,
            'surface_extra_rate' => 0.10,
            'weekend_multiplier' => 1.15,
            'holiday_multiplier' => 1.25,
            'early_morning_multiplier' => 1.10,
            'evening_multiplier' => 1.10,
            'minimum_hours' => 2,
            'minimum_price' => 50.00,
            'platform_commission_rate' => 20.00,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_rules');
    }
};
