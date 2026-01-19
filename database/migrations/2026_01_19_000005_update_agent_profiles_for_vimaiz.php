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
        Schema::table('agent_profiles', function (Blueprint $table) {
            // Company info (obligatoire) - only add if not exists
            if (!Schema::hasColumn('agent_profiles', 'siret')) {
                $table->string('siret', 14)->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('agent_profiles', 'company_type')) {
                $table->enum('company_type', ['auto_entrepreneur', 'societe'])->nullable()->after('siret');
            }
            if (!Schema::hasColumn('agent_profiles', 'company_name')) {
                $table->string('company_name')->nullable()->after('company_type');
            }
            
            // Requirements (obligatoire)
            if (!Schema::hasColumn('agent_profiles', 'has_own_equipment')) {
                $table->boolean('has_own_equipment')->default(false)->after('company_name');
            }
            if (!Schema::hasColumn('agent_profiles', 'has_driving_license')) {
                $table->boolean('has_driving_license')->default(false)->after('has_own_equipment');
            }
            if (!Schema::hasColumn('agent_profiles', 'has_vehicle')) {
                $table->boolean('has_vehicle')->default(false)->after('has_driving_license');
            }
            if (!Schema::hasColumn('agent_profiles', 'vehicle_type')) {
                $table->string('vehicle_type')->nullable()->after('has_vehicle');
            }
            
            // Coverage zones
            if (!Schema::hasColumn('agent_profiles', 'covered_zones')) {
                $table->json('covered_zones')->nullable()->after('vehicle_type');
            }
            if (!Schema::hasColumn('agent_profiles', 'coverage_radius_km')) {
                $table->integer('coverage_radius_km')->default(20)->after('covered_zones');
            }
            
            // Internal rating (visible only to admin)
            if (!Schema::hasColumn('agent_profiles', 'internal_rating')) {
                $table->decimal('internal_rating', 3, 2)->default(3.00)->after('coverage_radius_km');
            }
            if (!Schema::hasColumn('agent_profiles', 'missions_completed')) {
                $table->integer('missions_completed')->default(0)->after('internal_rating');
            }
            if (!Schema::hasColumn('agent_profiles', 'missions_cancelled')) {
                $table->integer('missions_cancelled')->default(0)->after('missions_completed');
            }
            if (!Schema::hasColumn('agent_profiles', 'missions_refused')) {
                $table->integer('missions_refused')->default(0)->after('missions_cancelled');
            }
            
            // Admin notes (internal)
            if (!Schema::hasColumn('agent_profiles', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('missions_refused');
            }
            if (!Schema::hasColumn('agent_profiles', 'warning_count')) {
                $table->integer('warning_count')->default(0)->after('admin_notes');
            }
            if (!Schema::hasColumn('agent_profiles', 'suspended_until')) {
                $table->timestamp('suspended_until')->nullable()->after('warning_count');
            }
            if (!Schema::hasColumn('agent_profiles', 'suspension_reason')) {
                $table->text('suspension_reason')->nullable()->after('suspended_until');
            }
            
            // Document uploads
            if (!Schema::hasColumn('agent_profiles', 'siret_document')) {
                $table->string('siret_document')->nullable()->after('suspension_reason');
            }
            if (!Schema::hasColumn('agent_profiles', 'driving_license_document')) {
                $table->string('driving_license_document')->nullable()->after('siret_document');
            }
            if (!Schema::hasColumn('agent_profiles', 'insurance_document')) {
                $table->string('insurance_document')->nullable()->after('driving_license_document');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $columns = [
                'siret',
                'company_type',
                'company_name',
                'has_own_equipment',
                'has_driving_license',
                'has_vehicle',
                'vehicle_type',
                'covered_zones',
                'coverage_radius_km',
                'internal_rating',
                'missions_completed',
                'missions_cancelled',
                'missions_refused',
                'admin_notes',
                'warning_count',
                'suspended_until',
                'suspension_reason',
                'siret_document',
                'driving_license_document',
                'insurance_document',
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('agent_profiles', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
