<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Service Categories
        $categories = [
            [
                'name' => 'Ménage Standard',
                'slug' => 'menage-standard',
                'description' => 'Services de ménage régulier pour votre domicile',
                'icon' => '🏠',
                'sort_order' => 1,
            ],
            [
                'name' => 'Ménage Profond',
                'slug' => 'menage-profond',
                'description' => 'Nettoyage en profondeur de votre espace',
                'icon' => '✨',
                'sort_order' => 2,
            ],
            [
                'name' => 'Spécialisé',
                'slug' => 'specialise',
                'description' => 'Services spécialisés (vitres, après travaux, etc.)',
                'icon' => '🔧',
                'sort_order' => 3,
            ],
        ];

        foreach ($categories as $categoryData) {
            $category = ServiceCategory::create($categoryData);

            // Add services for each category
            $this->createServicesForCategory($category);
        }
    }

    private function createServicesForCategory(ServiceCategory $category): void
    {
        $services = [];

        switch ($category->slug) {
            case 'menage-standard':
                $services = [
                    [
                        'name' => 'Ménage Appartement (< 100m²)',
                        'slug' => 'menage-appartement-petit',
                        'description' => 'Nettoyage complet d\'un appartement de moins de 100m²',
                        'base_price' => 150.00,
                        'estimated_duration_minutes' => 120,
                        'icon' => '🏢',
                    ],
                    [
                        'name' => 'Ménage Maison (100-200m²)',
                        'slug' => 'menage-maison-moyenne',
                        'description' => 'Nettoyage complet d\'une maison de 100 à 200m²',
                        'base_price' => 250.00,
                        'estimated_duration_minutes' => 180,
                        'icon' => '🏡',
                    ],
                    [
                        'name' => 'Ménage Villa (> 200m²)',
                        'slug' => 'menage-villa',
                        'description' => 'Nettoyage complet d\'une villa de plus de 200m²',
                        'base_price' => 400.00,
                        'estimated_duration_minutes' => 240,
                        'icon' => '🏰',
                    ],
                ];
                break;

            case 'menage-profond':
                $services = [
                    [
                        'name' => 'Nettoyage Profond Cuisine',
                        'slug' => 'nettoyage-profond-cuisine',
                        'description' => 'Dégraissage complet, four, hotte, placards',
                        'base_price' => 180.00,
                        'estimated_duration_minutes' => 150,
                        'icon' => '🍳',
                    ],
                    [
                        'name' => 'Nettoyage Profond Salle de Bain',
                        'slug' => 'nettoyage-profond-sdb',
                        'description' => 'Détartrage, joints, sanitaires',
                        'base_price' => 120.00,
                        'estimated_duration_minutes' => 90,
                        'icon' => '🚿',
                    ],
                    [
                        'name' => 'Nettoyage Complet Maison',
                        'slug' => 'nettoyage-complet-maison',
                        'description' => 'Nettoyage en profondeur de toute la maison',
                        'base_price' => 500.00,
                        'estimated_duration_minutes' => 360,
                        'icon' => '💎',
                    ],
                ];
                break;

            case 'specialise':
                $services = [
                    [
                        'name' => 'Nettoyage Vitres',
                        'slug' => 'nettoyage-vitres',
                        'description' => 'Nettoyage intérieur et extérieur des vitres',
                        'base_price' => 100.00,
                        'estimated_duration_minutes' => 90,
                        'icon' => '🪟',
                    ],
                    [
                        'name' => 'Nettoyage Après Travaux',
                        'slug' => 'nettoyage-apres-travaux',
                        'description' => 'Nettoyage complet après rénovation',
                        'base_price' => 350.00,
                        'estimated_duration_minutes' => 240,
                        'icon' => '🔨',
                    ],
                    [
                        'name' => 'Nettoyage Airbnb Express',
                        'slug' => 'nettoyage-airbnb',
                        'description' => 'Nettoyage rapide entre deux locations',
                        'base_price' => 120.00,
                        'estimated_duration_minutes' => 60,
                        'icon' => '⚡',
                    ],
                ];
                break;
        }

        foreach ($services as $serviceData) {
            $serviceData['category_id'] = $category->id;
            Service::create($serviceData);
        }
    }
}
