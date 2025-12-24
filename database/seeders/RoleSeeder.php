<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        $client = Role::findOrCreate('client');
        $agent = Role::findOrCreate('agent');
        $admin = Role::findOrCreate('admin');

        // Create permissions
        $permissions = [
            // Client permissions
            'create booking',
            'view own bookings',
            'cancel booking',
            'rate agent',

            // Agent permissions
            'view job requests',
            'accept job',
            'reject job',
            'complete job',
            'manage availability',
            'manage profile',
            'withdraw earnings',

            // Admin permissions
            'manage users',
            'verify agents',
            'manage bookings',
            'manage payments',
            'view reports',
            'resolve disputes',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Assign permissions to roles
        $client->givePermissionTo([
            'create booking',
            'view own bookings',
            'cancel booking',
            'rate agent',
        ]);

        $agent->givePermissionTo([
            'view job requests',
            'accept job',
            'reject job',
            'complete job',
            'manage availability',
            'manage profile',
            'withdraw earnings',
        ]);

        // Admin gets all permissions
        $admin->givePermissionTo(Permission::all());
    }
}
