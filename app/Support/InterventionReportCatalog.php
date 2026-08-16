<?php

namespace App\Support;

class InterventionReportCatalog
{
    /**
     * Arborescence complète côté Vimaiz. L'intervenant ne voit qu'une catégorie à la fois.
     *
     * @return list<array{
     *     id: string,
     *     label: string,
     *     emoji: string,
     *     groups: list<array{id: string, label: string, items: list<array{id: string, label: string, suggests_follow_up?: bool}>}>
     * }>
     */
    public static function categories(): array
    {
        return [
            [
                'id' => 'logement',
                'label' => 'Logement',
                'emoji' => '🏠',
                'groups' => [
                    [
                        'id' => 'etat',
                        'label' => 'État général',
                        'items' => [
                            ['id' => 'cluttered', 'label' => 'Logement très encombré'],
                            ['id' => 'unusual_smell', 'label' => 'Odeur inhabituelle'],
                            ['id' => 'unusual_dirt', 'label' => 'Forte saleté inhabituelle'],
                            ['id' => 'unusual_waste', 'label' => 'Présence de déchets inhabituels'],
                            ['id' => 'occupied', 'label' => 'Logement occupé / départ non effectué', 'suggests_follow_up' => true],
                            ['id' => 'access_impossible', 'label' => 'Accès au logement impossible', 'suggests_follow_up' => true],
                        ],
                    ],
                    [
                        'id' => 'structure',
                        'label' => 'Murs / plafonds / sols',
                        'items' => [
                            ['id' => 'unusual_stain', 'label' => 'Tache inhabituelle'],
                            ['id' => 'degradation', 'label' => 'Dégradation', 'suggests_follow_up' => true],
                            ['id' => 'hole', 'label' => 'Trou / impact', 'suggests_follow_up' => true],
                            ['id' => 'damaged_paint', 'label' => 'Peinture abîmée', 'suggests_follow_up' => true],
                            ['id' => 'damaged_floor', 'label' => 'Sol endommagé', 'suggests_follow_up' => true],
                            ['id' => 'broken_tiles', 'label' => 'Carrelage cassé', 'suggests_follow_up' => true],
                            ['id' => 'damaged_parquet', 'label' => 'Parquet abîmé', 'suggests_follow_up' => true],
                            ['id' => 'stained_carpet', 'label' => 'Moquette/tapis fortement taché'],
                            ['id' => 'damaged_ceiling', 'label' => 'Plafond endommagé', 'suggests_follow_up' => true],
                            ['id' => 'visible_humidity', 'label' => 'Humidité visible', 'suggests_follow_up' => true],
                            ['id' => 'visible_leak', 'label' => 'Fuite visible', 'suggests_follow_up' => true],
                        ],
                    ],
                    [
                        'id' => 'openings',
                        'label' => 'Portes / fenêtres',
                        'items' => [
                            ['id' => 'damaged_door', 'label' => 'Porte endommagée', 'suggests_follow_up' => true],
                            ['id' => 'lock_issue', 'label' => 'Serrure problématique', 'suggests_follow_up' => true],
                            ['id' => 'damaged_handle', 'label' => 'Poignée endommagée', 'suggests_follow_up' => true],
                            ['id' => 'damaged_window', 'label' => 'Fenêtre endommagée', 'suggests_follow_up' => true],
                            ['id' => 'shutter_issue', 'label' => 'Volet problématique', 'suggests_follow_up' => true],
                            ['id' => 'blind_issue', 'label' => 'Store problématique'],
                            ['id' => 'damaged_curtain', 'label' => 'Rideau/tringle endommagé'],
                            ['id' => 'missing_key', 'label' => 'Clé manquante', 'suggests_follow_up' => true],
                            ['id' => 'missing_remote', 'label' => 'Télécommande manquante'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'cuisine',
                'label' => 'Cuisine',
                'emoji' => '🍳',
                'groups' => [
                    [
                        'id' => 'appliances',
                        'label' => 'Électroménager',
                        'items' => [
                            ['id' => 'fridge', 'label' => 'Réfrigérateur problématique', 'suggests_follow_up' => true],
                            ['id' => 'freezer', 'label' => 'Congélateur problématique', 'suggests_follow_up' => true],
                            ['id' => 'oven', 'label' => 'Four problématique', 'suggests_follow_up' => true],
                            ['id' => 'microwave', 'label' => 'Micro-ondes problématique', 'suggests_follow_up' => true],
                            ['id' => 'hob', 'label' => 'Plaque de cuisson problématique', 'suggests_follow_up' => true],
                            ['id' => 'hood', 'label' => 'Hotte problématique', 'suggests_follow_up' => true],
                            ['id' => 'dishwasher', 'label' => 'Lave-vaisselle problématique', 'suggests_follow_up' => true],
                            ['id' => 'coffee_machine', 'label' => 'Machine à café problématique', 'suggests_follow_up' => true],
                            ['id' => 'kettle', 'label' => 'Bouilloire problématique'],
                            ['id' => 'toaster', 'label' => 'Grille-pain problématique'],
                            ['id' => 'other_appliance', 'label' => 'Autre appareil problématique', 'suggests_follow_up' => true],
                        ],
                    ],
                    [
                        'id' => 'plumbing',
                        'label' => 'Évier / plomberie',
                        'items' => [
                            ['id' => 'leaking_tap', 'label' => 'Robinet qui fuit', 'suggests_follow_up' => true],
                            ['id' => 'clogged_sink', 'label' => 'Évier bouché', 'suggests_follow_up' => true],
                            ['id' => 'slow_drain', 'label' => 'Évacuation lente', 'suggests_follow_up' => true],
                            ['id' => 'damaged_seal', 'label' => 'Joint endommagé', 'suggests_follow_up' => true],
                            ['id' => 'hot_water', 'label' => 'Eau chaude problématique', 'suggests_follow_up' => true],
                        ],
                    ],
                    [
                        'id' => 'equipment',
                        'label' => 'Vaisselle / équipements',
                        'items' => [
                            ['id' => 'broken_dishes', 'label' => 'Vaisselle cassée'],
                            ['id' => 'missing_dishes', 'label' => 'Vaisselle manquante'],
                            ['id' => 'missing_glass', 'label' => 'Verre/tasse manquant'],
                            ['id' => 'missing_utensil', 'label' => 'Ustensile manquant'],
                            ['id' => 'missing_pan', 'label' => 'Casserole/poêle manquante'],
                            ['id' => 'missing_equipment', 'label' => 'Équipement de cuisine manquant'],
                            ['id' => 'damaged_equipment', 'label' => 'Équipement endommagé'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'salle_de_bain',
                'label' => 'Salle de bain',
                'emoji' => '🚿',
                'groups' => [
                    [
                        'id' => 'bathroom',
                        'label' => 'Salles de bain / WC',
                        'items' => [
                            ['id' => 'leaking_tap', 'label' => 'Robinet qui fuit', 'suggests_follow_up' => true],
                            ['id' => 'shower_issue', 'label' => 'Douche problématique', 'suggests_follow_up' => true],
                            ['id' => 'damaged_shower_head', 'label' => 'Pommeau de douche endommagé'],
                            ['id' => 'damaged_hose', 'label' => 'Flexible endommagé'],
                            ['id' => 'slow_drain', 'label' => 'Évacuation bouchée/lente', 'suggests_follow_up' => true],
                            ['id' => 'sink_issue', 'label' => 'Lavabo problématique', 'suggests_follow_up' => true],
                            ['id' => 'toilet_issue', 'label' => 'WC problématique', 'suggests_follow_up' => true],
                            ['id' => 'flush_issue', 'label' => 'Chasse d\'eau problématique', 'suggests_follow_up' => true],
                            ['id' => 'leak', 'label' => 'Fuite', 'suggests_follow_up' => true],
                            ['id' => 'damaged_seal', 'label' => 'Joint détérioré', 'suggests_follow_up' => true],
                            ['id' => 'damaged_mirror', 'label' => 'Miroir endommagé'],
                            ['id' => 'damaged_screen', 'label' => 'Paroi de douche endommagée', 'suggests_follow_up' => true],
                            ['id' => 'damaged_towel_rail', 'label' => 'Porte-serviette endommagé'],
                            ['id' => 'damaged_vanity', 'label' => 'Meuble de salle de bain endommagé', 'suggests_follow_up' => true],
                            ['id' => 'missing_hairdryer', 'label' => 'Sèche-cheveux manquant'],
                            ['id' => 'missing_equipment', 'label' => 'Équipement manquant'],
                            ['id' => 'bulb', 'label' => 'Ampoule à remplacer'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'chambre',
                'label' => 'Chambre',
                'emoji' => '🛏️',
                'groups' => [
                    [
                        'id' => 'bedroom',
                        'label' => 'Chambres',
                        'items' => [
                            ['id' => 'damaged_mattress', 'label' => 'Matelas endommagé', 'suggests_follow_up' => true],
                            ['id' => 'damaged_base', 'label' => 'Sommier endommagé', 'suggests_follow_up' => true],
                            ['id' => 'damaged_bed', 'label' => 'Lit endommagé', 'suggests_follow_up' => true],
                            ['id' => 'damaged_headboard', 'label' => 'Tête de lit endommagée'],
                            ['id' => 'missing_pillow', 'label' => 'Oreiller manquant'],
                            ['id' => 'missing_duvet', 'label' => 'Couette manquante'],
                            ['id' => 'missing_linen', 'label' => 'Drap/linge manquant'],
                            ['id' => 'missing_blanket', 'label' => 'Couverture manquante'],
                            ['id' => 'damaged_furniture', 'label' => 'Meuble endommagé', 'suggests_follow_up' => true],
                            ['id' => 'lamp_issue', 'label' => 'Lampe problématique'],
                            ['id' => 'bulb', 'label' => 'Ampoule à remplacer'],
                            ['id' => 'curtain_issue', 'label' => 'Rideau/store problématique'],
                            ['id' => 'missing_remote', 'label' => 'Télécommande manquante'],
                            ['id' => 'missing_equipment', 'label' => 'Autre équipement manquant'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'salon',
                'label' => 'Salon',
                'emoji' => '🛋️',
                'groups' => [
                    [
                        'id' => 'living',
                        'label' => 'Salon / espaces de vie',
                        'items' => [
                            ['id' => 'damaged_sofa', 'label' => 'Canapé endommagé', 'suggests_follow_up' => true],
                            ['id' => 'damaged_armchair', 'label' => 'Fauteuil endommagé', 'suggests_follow_up' => true],
                            ['id' => 'damaged_table', 'label' => 'Table endommagée'],
                            ['id' => 'damaged_chair', 'label' => 'Chaise endommagée'],
                            ['id' => 'damaged_furniture', 'label' => 'Meuble endommagé', 'suggests_follow_up' => true],
                            ['id' => 'tv_issue', 'label' => 'TV problématique', 'suggests_follow_up' => true],
                            ['id' => 'missing_remote', 'label' => 'Télécommande manquante'],
                            ['id' => 'wifi_issue', 'label' => 'Box / Wi-Fi problématique', 'suggests_follow_up' => true],
                            ['id' => 'speaker_issue', 'label' => 'Enceinte problématique'],
                            ['id' => 'lamp_issue', 'label' => 'Lampe problématique'],
                            ['id' => 'bulb', 'label' => 'Ampoule à remplacer'],
                            ['id' => 'damaged_decor', 'label' => 'Décoration endommagée'],
                            ['id' => 'missing_object', 'label' => 'Objet manquant'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'exterieur',
                'label' => 'Extérieur',
                'emoji' => '🌳',
                'groups' => [
                    [
                        'id' => 'garden',
                        'label' => 'Terrasse / jardin',
                        'items' => [
                            ['id' => 'damaged_outdoor_furniture', 'label' => 'Mobilier extérieur endommagé', 'suggests_follow_up' => true],
                            ['id' => 'missing_outdoor_furniture', 'label' => 'Mobilier manquant'],
                            ['id' => 'parasol_issue', 'label' => 'Parasols problématiques'],
                            ['id' => 'bbq_issue', 'label' => 'Barbecue problématique', 'suggests_follow_up' => true],
                            ['id' => 'bbq_cleaning', 'label' => 'Barbecue à nettoyer'],
                            ['id' => 'damaged_terrace', 'label' => 'Terrasse endommagée', 'suggests_follow_up' => true],
                            ['id' => 'outdoor_lighting', 'label' => 'Éclairage extérieur problématique', 'suggests_follow_up' => true],
                            ['id' => 'gate_issue', 'label' => 'Portail problématique', 'suggests_follow_up' => true],
                            ['id' => 'damaged_fence', 'label' => 'Clôture endommagée', 'suggests_follow_up' => true],
                            ['id' => 'garden_needed', 'label' => 'Jardin nécessitant une intervention', 'suggests_follow_up' => true],
                            ['id' => 'outdoor_degradation', 'label' => 'Dégradation extérieure', 'suggests_follow_up' => true],
                        ],
                    ],
                    [
                        'id' => 'pool',
                        'label' => 'Piscine / spa / jacuzzi',
                        'items' => [
                            ['id' => 'pool_needed', 'label' => 'Piscine nécessitant une intervention', 'suggests_follow_up' => true],
                            ['id' => 'spa_issue', 'label' => 'Jacuzzi/spa problématique', 'suggests_follow_up' => true],
                            ['id' => 'missing_pool_equipment', 'label' => 'Équipement piscine manquant'],
                            ['id' => 'damaged_pool_equipment', 'label' => 'Équipement piscine endommagé', 'suggests_follow_up' => true],
                            ['id' => 'cover_issue', 'label' => 'Couverture/bâche problématique'],
                            ['id' => 'pool_lighting', 'label' => 'Éclairage piscine problématique', 'suggests_follow_up' => true],
                            ['id' => 'abnormal_temperature', 'label' => 'Température anormale'],
                            ['id' => 'other_pool', 'label' => 'Autre anomalie', 'suggests_follow_up' => true],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'electricite',
                'label' => 'Électricité',
                'emoji' => '🔌',
                'groups' => [
                    [
                        'id' => 'electrical',
                        'label' => 'Électricité / éclairage',
                        'items' => [
                            ['id' => 'bulb', 'label' => 'Ampoule à remplacer'],
                            ['id' => 'switch_issue', 'label' => 'Interrupteur problématique', 'suggests_follow_up' => true],
                            ['id' => 'outlet_issue', 'label' => 'Prise électrique problématique', 'suggests_follow_up' => true],
                            ['id' => 'indoor_lighting', 'label' => 'Éclairage intérieur problématique', 'suggests_follow_up' => true],
                            ['id' => 'outdoor_lighting', 'label' => 'Éclairage extérieur problématique', 'suggests_follow_up' => true],
                            ['id' => 'breaker_tripped', 'label' => 'Disjonction constatée', 'suggests_follow_up' => true],
                            ['id' => 'electrical_equipment', 'label' => 'Équipement électrique problématique', 'suggests_follow_up' => true],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'chauffage',
                'label' => 'Chauffage / clim',
                'emoji' => '🌡️',
                'groups' => [
                    [
                        'id' => 'hvac',
                        'label' => 'Chauffage / climatisation',
                        'items' => [
                            ['id' => 'heating_issue', 'label' => 'Chauffage problématique', 'suggests_follow_up' => true],
                            ['id' => 'ac_issue', 'label' => 'Climatisation problématique', 'suggests_follow_up' => true],
                            ['id' => 'missing_remote', 'label' => 'Télécommande manquante'],
                            ['id' => 'thermostat_issue', 'label' => 'Thermostat problématique', 'suggests_follow_up' => true],
                            ['id' => 'radiator_issue', 'label' => 'Radiateur problématique', 'suggests_follow_up' => true],
                            ['id' => 'unusual_temperature', 'label' => 'Température inhabituelle'],
                            ['id' => 'unusual_noise', 'label' => 'Bruit inhabituel'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'consommables',
                'label' => 'Consommables',
                'emoji' => '📦',
                'groups' => [
                    [
                        'id' => 'consumables',
                        'label' => 'À réapprovisionner',
                        'items' => [
                            ['id' => 'toilet_paper', 'label' => 'Papier toilette à réapprovisionner'],
                            ['id' => 'paper_towels', 'label' => 'Essuie-tout à réapprovisionner'],
                            ['id' => 'soap', 'label' => 'Savon à réapprovisionner'],
                            ['id' => 'shower_gel', 'label' => 'Gel douche à réapprovisionner'],
                            ['id' => 'shampoo', 'label' => 'Shampoing à réapprovisionner'],
                            ['id' => 'dish_soap', 'label' => 'Liquide vaisselle à réapprovisionner'],
                            ['id' => 'coffee_capsules', 'label' => 'Capsules café à réapprovisionner'],
                            ['id' => 'trash_bags', 'label' => 'Sacs poubelle à réapprovisionner'],
                            ['id' => 'cleaning_products', 'label' => 'Produits ménagers à réapprovisionner'],
                            ['id' => 'linen', 'label' => 'Linge à réapprovisionner'],
                            ['id' => 'other_consumable', 'label' => 'Autre consommable'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'acces',
                'label' => 'Accès / sécurité',
                'emoji' => '🔑',
                'groups' => [
                    [
                        'id' => 'access',
                        'label' => 'Accès / sécurité',
                        'items' => [
                            ['id' => 'missing_key', 'label' => 'Clé manquante', 'suggests_follow_up' => true],
                            ['id' => 'missing_badge', 'label' => 'Badge manquant', 'suggests_follow_up' => true],
                            ['id' => 'access_code', 'label' => 'Code d\'accès problématique', 'suggests_follow_up' => true],
                            ['id' => 'keybox_issue', 'label' => 'Boîte à clés problématique', 'suggests_follow_up' => true],
                            ['id' => 'lock_issue', 'label' => 'Serrure problématique', 'suggests_follow_up' => true],
                            ['id' => 'door_issue', 'label' => 'Porte problématique', 'suggests_follow_up' => true],
                            ['id' => 'alarm_issue', 'label' => 'Alarme problématique', 'suggests_follow_up' => true],
                            ['id' => 'smoke_detector', 'label' => 'Détecteur de fumée problématique', 'suggests_follow_up' => true],
                            ['id' => 'missing_safety', 'label' => 'Équipement de sécurité manquant', 'suggests_follow_up' => true],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'linge',
                'label' => 'Linge',
                'emoji' => '🧺',
                'groups' => [
                    [
                        'id' => 'linen',
                        'label' => 'Linge',
                        'items' => [
                            ['id' => 'missing_sheet', 'label' => 'Drap manquant'],
                            ['id' => 'missing_towel', 'label' => 'Serviette manquante'],
                            ['id' => 'missing_bath_towel', 'label' => 'Serviette de bain manquante'],
                            ['id' => 'missing_bath_mat', 'label' => 'Tapis de bain manquant'],
                            ['id' => 'missing_tea_towel', 'label' => 'Torchons manquants'],
                            ['id' => 'damaged_linen', 'label' => 'Linge endommagé'],
                            ['id' => 'stained_linen', 'label' => 'Linge taché'],
                            ['id' => 'insufficient_quantity', 'label' => 'Quantité insuffisante'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'voyageurs',
                'label' => 'Voyageurs',
                'emoji' => '⚠️',
                'groups' => [
                    [
                        'id' => 'guests',
                        'label' => 'Voyageurs / objets laissés',
                        'items' => [
                            ['id' => 'forgotten_item', 'label' => 'Objet personnel oublié'],
                            ['id' => 'left_food', 'label' => 'Nourriture laissée'],
                            ['id' => 'unusual_waste', 'label' => 'Déchets inhabituels'],
                            ['id' => 'found_item', 'label' => 'Objet trouvé'],
                            ['id' => 'dangerous_item', 'label' => 'Objet potentiellement dangereux', 'suggests_follow_up' => true],
                            ['id' => 'unusual_damage', 'label' => 'Dégradation inhabituelle', 'suggests_follow_up' => true],
                            ['id' => 'abnormally_dirty', 'label' => 'Logement anormalement sale'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'maintenance',
                'label' => 'Maintenance',
                'emoji' => '🛠️',
                'groups' => [
                    [
                        'id' => 'trade',
                        'label' => 'Type d\'intervention constatée',
                        'items' => [
                            ['id' => 'plumbing', 'label' => 'Plomberie', 'suggests_follow_up' => true],
                            ['id' => 'electricity', 'label' => 'Électricité', 'suggests_follow_up' => true],
                            ['id' => 'locksmith', 'label' => 'Serrurerie', 'suggests_follow_up' => true],
                            ['id' => 'heating', 'label' => 'Chauffage', 'suggests_follow_up' => true],
                            ['id' => 'ac', 'label' => 'Climatisation', 'suggests_follow_up' => true],
                            ['id' => 'appliance', 'label' => 'Électroménager', 'suggests_follow_up' => true],
                            ['id' => 'furniture', 'label' => 'Mobilier', 'suggests_follow_up' => true],
                            ['id' => 'paint', 'label' => 'Peinture', 'suggests_follow_up' => true],
                            ['id' => 'floor', 'label' => 'Sol', 'suggests_follow_up' => true],
                            ['id' => 'carpentry', 'label' => 'Menuiserie', 'suggests_follow_up' => true],
                            ['id' => 'outdoor', 'label' => 'Extérieur', 'suggests_follow_up' => true],
                            ['id' => 'pool', 'label' => 'Piscine/spa', 'suggests_follow_up' => true],
                            ['id' => 'other_maintenance', 'label' => 'Autre maintenance', 'suggests_follow_up' => true],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'autre',
                'label' => 'Autre',
                'emoji' => '📋',
                'groups' => [
                    [
                        'id' => 'other',
                        'label' => 'Autre élément',
                        'items' => [
                            ['id' => 'other', 'label' => 'Autre élément à signaler', 'requires_notes' => true],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * @return list<array{id: string, label: string, emoji: string}>
     */
    public static function categoryOptions(): array
    {
        return array_map(fn (array $category) => [
            'id' => $category['id'],
            'label' => $category['label'],
            'emoji' => $category['emoji'],
        ], self::categories());
    }

    public static function findCategory(string $categoryId): ?array
    {
        foreach (self::categories() as $category) {
            if ($category['id'] === $categoryId) {
                return $category;
            }
        }

        return null;
    }

    public static function findItem(string $categoryId, string $typeId): ?array
    {
        $category = self::findCategory($categoryId);
        if (! $category) {
            return null;
        }

        foreach ($category['groups'] as $group) {
            foreach ($group['items'] as $item) {
                if ($item['id'] === $typeId) {
                    return [
                        ...$item,
                        'category_id' => $category['id'],
                        'category_label' => $category['label'],
                        'group_id' => $group['id'],
                        'group_label' => $group['label'],
                    ];
                }
            }
        }

        return null;
    }

    public static function resolveAnomaly(string $categoryId, string $typeId, ?string $notes = null): array
    {
        $item = self::findItem($categoryId, $typeId);
        if (! $item) {
            throw new \InvalidArgumentException('Élément de rapport invalide.');
        }

        $requiresNotes = ! empty($item['requires_notes']) || $typeId === 'other' || str_starts_with($typeId, 'other_');
        $notes = $notes !== null ? trim($notes) : '';

        if ($requiresNotes && $notes === '') {
            throw new \InvalidArgumentException('Veuillez décrire brièvement le problème.');
        }

        return [
            'category' => $item['category_id'],
            'category_label' => $item['category_label'],
            'type' => $item['id'],
            'label' => $item['label'],
            'notes' => $notes !== '' ? $notes : null,
            'suggests_follow_up' => (bool) ($item['suggests_follow_up'] ?? false),
        ];
    }
}
