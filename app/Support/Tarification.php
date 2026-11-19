<?php

namespace App\Support;

/**
 * Grille tarifaire Vimaiz (brief « Estimateur » de novembre 2026).
 *
 * - 3,20 €/m² sur toute la surface totale cumulée, quelle que soit la taille
 *   (décision du 19/11/2026 : tarif unique, pas de tarif dégressif) ;
 * - surface totale cumulée = surface principale + m² des espaces annexes ;
 * - options et équipements spécifiques ajoutés au forfait ;
 * - commission Vimaiz : 15 % (85 % reversés à l'équipe d'intervenants).
 *
 * Même grille que resources/js/lib/tarification.ts (estimateur public et
 * formulaire de demande) : toute modification doit être faite des deux côtés.
 */
class Tarification
{
    public const RATE_STANDARD = 3.20;

    public const MIN_SURFACE = 200;

    public const COMMISSION_RATE = 15;

    /** Espaces annexes hors habitation principale (pas de chambres). */
    public const ANNEXES = [
        'garage' => 'Garage aménagé',
        'buanderie' => 'Buanderie',
        'cave' => 'Cave',
        'dependance' => 'Dépendance / Mazot',
        'pool_house' => 'Pool-house',
    ];

    /**
     * Options et équipements spécifiques : prix unitaire et libellés.
     *
     * @var array<string, array{label: string, detail: ?string, price: float, unit: string, short: string}>
     */
    public const OPTIONS = [
        'beds' => [
            'label' => 'Lits à préparer (linge propre fourni sur place)',
            'detail' => 'Retrait du linge sale et mise en place au carré avec votre stock de linge propre',
            'price' => 25.0,
            'unit' => 'lit',
            'short' => 'Lit',
        ],
        'ironing' => [
            'label' => 'Repassage et rangement du linge',
            'detail' => null,
            'price' => 35.0,
            'unit' => 'heure',
            'short' => 'h de repassage',
        ],
        'bay_windows' => [
            'label' => 'Grandes baies vitrées (> 3 m)',
            'detail' => null,
            'price' => 20.0,
            'unit' => 'baie',
            'short' => 'Baie vitrée',
        ],
        'spa' => [
            'label' => 'Jacuzzi / Sauna / Hammam',
            'detail' => null,
            'price' => 60.0,
            'unit' => 'unité',
            'short' => 'Jacuzzi / Sauna / Hammam',
        ],
        'fireplace' => [
            'label' => 'Cheminée ou poêle à bois',
            'detail' => null,
            'price' => 30.0,
            'unit' => 'unité',
            'short' => 'Cheminée / poêle',
        ],
        'terrace' => [
            'label' => 'Grande terrasse (> 30 m²)',
            'detail' => null,
            'price' => 35.0,
            'unit' => 'unité',
            'short' => 'Grande terrasse',
        ],
    ];

    public const MAX_OPTION_QUANTITY = 50;

    public const MAX_ANNEX_SURFACE = 5000;

    public static function ratePerM2(float $totalSurface): float
    {
        return self::RATE_STANDARD;
    }

    /**
     * Ne garde que les annexes connues avec une surface positive.
     *
     * @return list<array{type: string, label: string, surface: int}>
     */
    public static function sanitizeAnnexes(?array $annexes): array
    {
        $clean = [];

        foreach ($annexes ?? [] as $annex) {
            $type = (string) ($annex['type'] ?? '');
            $surface = (int) round((float) ($annex['surface'] ?? 0));

            if (! isset(self::ANNEXES[$type]) || $surface <= 0) {
                continue;
            }

            $clean[] = [
                'type' => $type,
                'label' => self::ANNEXES[$type],
                'surface' => min($surface, self::MAX_ANNEX_SURFACE),
            ];
        }

        return $clean;
    }

    /**
     * Ne garde que les options connues avec une quantité positive.
     *
     * @return array<string, int>
     */
    public static function sanitizeOptions(?array $options): array
    {
        $clean = [];

        foreach ($options ?? [] as $key => $quantity) {
            $quantity = (int) $quantity;

            if (isset(self::OPTIONS[$key]) && $quantity > 0) {
                $clean[$key] = min($quantity, self::MAX_OPTION_QUANTITY);
            }
        }

        return $clean;
    }

    public static function annexSurface(?array $annexes): int
    {
        return array_sum(array_column(self::sanitizeAnnexes($annexes), 'surface'));
    }

    public static function totalSurface(float|int|null $mainSurface, ?array $annexes): float
    {
        return (float) $mainSurface + self::annexSurface($annexes);
    }

    /**
     * Forfait complet : surface totale cumulée × tarif au m² + options,
     * puis répartition 85 % équipe / 15 % Vimaiz.
     *
     * @return array{
     *     main_surface: float, annex_surface: int, total_surface: float,
     *     rate: float, surface_amount: float, options_amount: float,
     *     total: float, commission_rate: int, commission: float, agent: float,
     *     team_size: int, annexes: array, options: array
     * }
     */
    public static function estimate(float|int|null $mainSurface, ?array $annexes = [], ?array $options = []): array
    {
        $annexes = self::sanitizeAnnexes($annexes);
        $options = self::sanitizeOptions($options);

        $main = (float) $mainSurface;
        $annexSurface = array_sum(array_column($annexes, 'surface'));
        $total = $main + $annexSurface;
        $rate = self::ratePerM2($total);
        $surfaceAmount = round($total * $rate, 2);

        $optionLines = [];
        $optionsAmount = 0.0;
        foreach ($options as $key => $quantity) {
            $line = round($quantity * self::OPTIONS[$key]['price'], 2);
            $optionsAmount += $line;
            $optionLines[] = [
                'key' => $key,
                'label' => self::OPTIONS[$key]['label'],
                'quantity' => $quantity,
                'unit_price' => self::OPTIONS[$key]['price'],
                'amount' => $line,
            ];
        }

        $grandTotal = round($surfaceAmount + $optionsAmount, 2);
        $commission = round($grandTotal * self::COMMISSION_RATE / 100, 2);

        return [
            'main_surface' => $main,
            'annex_surface' => $annexSurface,
            'total_surface' => $total,
            'rate' => $rate,
            'surface_amount' => $surfaceAmount,
            'options_amount' => round($optionsAmount, 2),
            'total' => $grandTotal,
            'commission_rate' => self::COMMISSION_RATE,
            'commission' => $commission,
            'agent' => round($grandTotal - $commission, 2),
            'team_size' => Brigade::sizeForSurface($total),
            'annexes' => $annexes,
            'options' => $optionLines,
        ];
    }

    /** « 300 m² + 100 m² (Garage aménagé) » */
    public static function surfaceLabel(float|int|null $mainSurface, ?array $annexes): string
    {
        $label = self::formatM2($mainSurface);

        foreach (self::sanitizeAnnexes($annexes) as $annex) {
            $label .= ' + '.self::formatM2($annex['surface']).' ('.$annex['label'].')';
        }

        return $label;
    }

    /** « 2 Lits • 1 Jacuzzi / Sauna / Hammam » */
    public static function optionsLabel(?array $options): string
    {
        $parts = [];

        foreach (self::sanitizeOptions($options) as $key => $quantity) {
            $parts[] = $quantity.' '.self::OPTIONS[$key]['short'].($quantity > 1 && in_array($key, ['beds', 'bay_windows'], true) ? 's' : '');
        }

        return implode(' • ', $parts);
    }

    private static function formatM2(float|int|null $value): string
    {
        $value = (float) $value;

        return rtrim(rtrim(number_format($value, 2, ',', ' '), '0'), ',').' m²';
    }
}
