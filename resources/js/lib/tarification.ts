/**
 * Grille tarifaire Vimaiz (brief « Estimateur » de novembre 2026).
 * Même grille que app/Support/Tarification.php : toute modification doit
 * être faite des deux côtés.
 */

/** 3,20 €/m² pour toutes les tailles (décision du 19/11/2026). */
export const RATE_STANDARD = 3.2;
export const MIN_SURFACE = 200;
export const COMMISSION_RATE = 15;
export const MAX_M2_PER_INTERVENANT = 125;
export const MAX_OPTION_QUANTITY = 50;

export const ANNEXES = [
    { key: 'garage', label: 'Garage aménagé' },
    { key: 'buanderie', label: 'Buanderie' },
    { key: 'cave', label: 'Cave' },
    { key: 'dependance', label: 'Dépendance / Mazot' },
    { key: 'pool_house', label: 'Pool-house' },
] as const;

export type AnnexKey = (typeof ANNEXES)[number]['key'];

export interface Annex {
    type: AnnexKey;
    surface: number;
}

export const OPTIONS = [
    {
        key: 'beds',
        label: 'Lits à préparer (linge propre fourni sur place)',
        detail: 'Retrait du linge sale et mise en place au carré avec votre stock de linge propre',
        price: 25,
        unit: 'lit',
        short: ['Lit', 'Lits'],
    },
    {
        key: 'ironing',
        label: 'Repassage et rangement du linge',
        detail: null,
        price: 35,
        unit: 'heure',
        short: ['h de repassage', 'h de repassage'],
    },
    {
        key: 'bay_windows',
        label: 'Grandes baies vitrées (> 3 m)',
        detail: null,
        price: 20,
        unit: 'baie',
        short: ['Baie vitrée', 'Baies vitrées'],
    },
    {
        key: 'spa',
        label: 'Jacuzzi / Sauna / Hammam',
        detail: null,
        price: 60,
        unit: 'unité',
        short: ['Jacuzzi / Sauna / Hammam', 'Jacuzzi / Sauna / Hammam'],
    },
    {
        key: 'fireplace',
        label: 'Cheminée ou poêle à bois',
        detail: null,
        price: 30,
        unit: 'unité',
        short: ['Cheminée / poêle', 'Cheminées / poêles'],
    },
    {
        key: 'terrace',
        label: 'Grande terrasse (> 30 m²)',
        detail: null,
        price: 35,
        unit: 'unité',
        short: ['Grande terrasse', 'Grandes terrasses'],
    },
] as const;

export type OptionKey = (typeof OPTIONS)[number]['key'];
export type OptionQuantities = Partial<Record<OptionKey, number>>;

export function annexLabel(type: string): string {
    return ANNEXES.find((annex) => annex.key === type)?.label ?? type;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ratePerM2(_totalSurface: number): number {
    return RATE_STANDARD;
}

/** 125 m² maximum par intervenant, au moins 2 dès 200 m². */
export function teamSizeFor(totalSurface: number): number {
    if (totalSurface < MIN_SURFACE) {
        return 1;
    }
    return Math.max(2, Math.ceil(totalSurface / MAX_M2_PER_INTERVENANT));
}

const round2 = (value: number) => Math.round(value * 100) / 100;

export function estimate(mainSurface: number, annexes: Annex[], options: OptionQuantities) {
    const validAnnexes = annexes.filter((annex) => annex.surface > 0);
    const annexSurface = validAnnexes.reduce((sum, annex) => sum + annex.surface, 0);
    const totalSurface = mainSurface + annexSurface;
    const rate = ratePerM2(totalSurface);
    const surfaceAmount = round2(totalSurface * rate);
    const optionsAmount = round2(
        OPTIONS.reduce((sum, option) => sum + (options[option.key] ?? 0) * option.price, 0),
    );
    const total = round2(surfaceAmount + optionsAmount);
    const commission = round2((total * COMMISSION_RATE) / 100);

    return {
        annexSurface,
        totalSurface,
        rate,
        surfaceAmount,
        optionsAmount,
        total,
        commission,
        agent: round2(total - commission),
        teamSize: teamSizeFor(totalSurface),
        annexes: validAnnexes,
    };
}

/** « 4 Lits • 1 Jacuzzi / Sauna / Hammam » */
export function optionsSummary(options: OptionQuantities): string[] {
    return OPTIONS.filter((option) => (options[option.key] ?? 0) > 0).map((option) => {
        const quantity = options[option.key] ?? 0;
        return `${quantity} ${quantity > 1 ? option.short[1] : option.short[0]}`;
    });
}

/** « 2 600 € » / « 1 037,40 € » */
export function formatEuro(value: number): string {
    return `${value.toLocaleString('fr-FR', {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
    })} €`;
}

/** Part estimée d'un intervenant d'une équipe (pool ÷ effectif prévu). */
export function shareOf(pool: number | string, teamSize?: number | null): number {
    const size = Math.max(1, Number(teamSize) || 1);
    return round2(Number(pool) / size);
}
