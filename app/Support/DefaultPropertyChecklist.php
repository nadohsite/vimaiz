<?php

namespace App\Support;

class DefaultPropertyChecklist
{
    /**
     * Checklist par défaut proposée à l'enregistrement d'un logement.
     * Structure : sections[{ id, title, emoji, items[{ id, label }] }]
     *
     * @return list<array{id: string, title: string, emoji: string, items: list<array{id: string, label: string}>}>
     */
    public static function sections(): array
    {
        return [
            [
                'id' => 'salon',
                'title' => 'Salon',
                'emoji' => '🛋️',
                'items' => [
                    ['id' => 'salon-dust', 'label' => 'Dépoussiérer les meubles'],
                    ['id' => 'salon-vacuum', 'label' => 'Aspirer le sol'],
                    ['id' => 'salon-mop', 'label' => 'Laver le sol'],
                    ['id' => 'salon-cushions', 'label' => 'Ranger les coussins'],
                    ['id' => 'salon-forgotten', 'label' => 'Vérifier qu\'aucun objet n\'a été oublié'],
                ],
            ],
            [
                'id' => 'cuisine',
                'title' => 'Cuisine',
                'emoji' => '🍽️',
                'items' => [
                    ['id' => 'cuisine-counter', 'label' => 'Nettoyer le plan de travail'],
                    ['id' => 'cuisine-sink', 'label' => 'Nettoyer l\'évier'],
                    ['id' => 'cuisine-hob', 'label' => 'Nettoyer les plaques de cuisson'],
                    ['id' => 'cuisine-oven', 'label' => 'Nettoyer le four'],
                    ['id' => 'cuisine-microwave', 'label' => 'Nettoyer le micro-ondes'],
                    ['id' => 'cuisine-fridge', 'label' => 'Vérifier le réfrigérateur'],
                    ['id' => 'cuisine-trash', 'label' => 'Vider les poubelles'],
                ],
            ],
            [
                'id' => 'salle-de-bain',
                'title' => 'Salle de bain',
                'emoji' => '🚿',
                'items' => [
                    ['id' => 'sdb-shower', 'label' => 'Nettoyer la douche ou la baignoire'],
                    ['id' => 'sdb-toilet', 'label' => 'Désinfecter les WC'],
                    ['id' => 'sdb-sink', 'label' => 'Nettoyer le lavabo'],
                    ['id' => 'sdb-mirrors', 'label' => 'Nettoyer les miroirs'],
                    ['id' => 'sdb-floor', 'label' => 'Laver le sol'],
                ],
            ],
            [
                'id' => 'chambres',
                'title' => 'Chambres',
                'emoji' => '🛏️',
                'items' => [
                    ['id' => 'chambres-beds', 'label' => 'Faire les lits'],
                    ['id' => 'chambres-linen', 'label' => 'Changer le linge de lit'],
                    ['id' => 'chambres-dust', 'label' => 'Dépoussiérer'],
                    ['id' => 'chambres-vacuum', 'label' => 'Aspirer'],
                    ['id' => 'chambres-mop', 'label' => 'Laver le sol'],
                ],
            ],
            [
                'id' => 'terrasse',
                'title' => 'Terrasse / Balcon',
                'emoji' => '🌿',
                'items' => [
                    ['id' => 'terrasse-sweep', 'label' => 'Balayer'],
                    ['id' => 'terrasse-furniture', 'label' => 'Ranger le mobilier extérieur'],
                    ['id' => 'terrasse-table', 'label' => 'Nettoyer la table'],
                    ['id' => 'terrasse-trash', 'label' => 'Ramasser les déchets'],
                ],
            ],
            [
                'id' => 'consommables',
                'title' => 'Consommables',
                'emoji' => '📦',
                'items' => [
                    ['id' => 'conso-toilet-paper', 'label' => 'Vérifier le papier toilette'],
                    ['id' => 'conso-soap', 'label' => 'Vérifier le savon'],
                    ['id' => 'conso-dish', 'label' => 'Vérifier le liquide vaisselle'],
                    ['id' => 'conso-coffee', 'label' => 'Vérifier les capsules de café'],
                    ['id' => 'conso-cleaning', 'label' => 'Vérifier les produits d\'entretien'],
                    ['id' => 'conso-report', 'label' => 'Signaler les consommables manquants'],
                ],
            ],
            [
                'id' => 'verifications',
                'title' => 'Vérifications',
                'emoji' => '🔍',
                'items' => [
                    ['id' => 'verif-appliances', 'label' => 'Vérifier l\'état des appareils électroménagers'],
                    ['id' => 'verif-damage', 'label' => 'Signaler toute casse ou anomalie'],
                    ['id' => 'verif-lights', 'label' => 'Vérifier les lumières'],
                    ['id' => 'verif-windows', 'label' => 'Fermer les fenêtres'],
                    ['id' => 'verif-doors', 'label' => 'Vérifier les portes'],
                    ['id' => 'verif-keys', 'label' => 'Remettre les clés à leur emplacement'],
                ],
            ],
        ];
    }

    /**
     * Filtre la checklist d'un bien selon les axes / tâches choisis pour une demande.
     *
     * @param  list<array<string, mixed>>|null  $checklist
     * @param  list<string>  $sectionIds
     * @param  list<string>|null  $itemIds  Si null, toutes les tâches des sections sélectionnées
     * @return list<array{id: string, title: string, emoji: string, items: list<array{id: string, label: string}>}>
     */
    public static function filterForRequest(?array $checklist, array $sectionIds, ?array $itemIds = null): array
    {
        $sections = $checklist ?: self::sections();
        $sectionIdSet = array_fill_keys(array_map('strval', $sectionIds), true);
        $itemIdSet = $itemIds === null
            ? null
            : array_fill_keys(array_map('strval', $itemIds), true);

        $filtered = [];

        foreach ($sections as $section) {
            $sectionId = (string) ($section['id'] ?? '');
            if ($sectionId === '' || !isset($sectionIdSet[$sectionId])) {
                continue;
            }

            if (empty($section['items']) || !is_array($section['items'])) {
                continue;
            }

            $items = [];
            foreach ($section['items'] as $item) {
                $itemId = (string) ($item['id'] ?? '');
                $label = trim((string) ($item['label'] ?? ''));
                if ($itemId === '' || $label === '') {
                    continue;
                }
                if ($itemIdSet !== null && !isset($itemIdSet[$itemId])) {
                    continue;
                }

                $items[] = [
                    'id' => $itemId,
                    'label' => $label,
                ];
            }

            if ($items === []) {
                continue;
            }

            $filtered[] = [
                'id' => $sectionId,
                'title' => (string) ($section['title'] ?? 'Section'),
                'emoji' => (string) ($section['emoji'] ?? ''),
                'items' => $items,
            ];
        }

        return $filtered;
    }

    /**
     * Snapshot prêt pour une mission (ajoute checked / checked_at).
     *
     * @param  list<array<string, mixed>>|null  $checklist
     * @return list<array<string, mixed>>
     */
    public static function snapshotForMission(?array $checklist): array
    {
        $sections = $checklist ?: self::sections();
        $snapshot = [];

        foreach ($sections as $section) {
            if (empty($section['items']) || !is_array($section['items'])) {
                continue;
            }

            $items = [];
            foreach ($section['items'] as $item) {
                $label = trim((string) ($item['label'] ?? ''));
                if ($label === '') {
                    continue;
                }

                $items[] = [
                    'id' => (string) ($item['id'] ?? uniqid('item_', true)),
                    'label' => $label,
                    'checked' => false,
                    'checked_at' => null,
                ];
            }

            if ($items === []) {
                continue;
            }

            $snapshot[] = [
                'id' => (string) ($section['id'] ?? uniqid('section_', true)),
                'title' => (string) ($section['title'] ?? 'Section'),
                'emoji' => (string) ($section['emoji'] ?? ''),
                'items' => $items,
            ];
        }

        return $snapshot;
    }

    /**
     * @param  list<array<string, mixed>>|null  $checklist
     */
    public static function isComplete(?array $checklist): bool
    {
        if (empty($checklist)) {
            return true;
        }

        foreach ($checklist as $section) {
            foreach ($section['items'] ?? [] as $item) {
                if (empty($item['checked'])) {
                    return false;
                }
            }
        }

        return true;
    }
}
