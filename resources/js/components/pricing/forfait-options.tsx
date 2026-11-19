import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ANNEXES,
    MAX_OPTION_QUANTITY,
    OPTIONS,
    estimate,
    formatEuro,
    type Annex,
    type AnnexKey,
    type OptionQuantities,
} from '@/lib/tarification';
import { Layers, Minus, Plus, Trash2 } from 'lucide-react';

interface Props {
    surface: number;
    annexes: Annex[];
    options: OptionQuantities;
    onAnnexesChange: (annexes: Annex[]) => void;
    onOptionsChange: (options: OptionQuantities) => void;
    errors?: Record<string, string | undefined>;
}

/**
 * Espaces annexes + options du forfait (brief « Estimateur »), avec le
 * forfait indicatif recalculé en direct. Le devis final reste établi par
 * Vimaiz.
 */
export default function ForfaitOptions({
    surface,
    annexes,
    options,
    onAnnexesChange,
    onOptionsChange,
    errors = {},
}: Props) {
    const result = estimate(surface || 0, annexes, options);
    const usedTypes = annexes.map((annex) => annex.type);
    const nextType = ANNEXES.find((annex) => !usedTypes.includes(annex.key))?.key;

    const updateAnnex = (index: number, patch: Partial<Annex>) =>
        onAnnexesChange(annexes.map((annex, i) => (i === index ? { ...annex, ...patch } : annex)));

    const setQuantity = (key: keyof OptionQuantities, quantity: number) =>
        onOptionsChange({
            ...options,
            [key]: Math.min(MAX_OPTION_QUANTITY, Math.max(0, quantity)),
        });

    return (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Layers className="h-5 w-5 text-sky-500" />
                    Espaces annexes et options
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                    Optionnel. Les annexes s&apos;ajoutent à la surface du logement ; les options
                    s&apos;ajoutent au forfait.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Espaces annexes hors habitation principale
                    </p>
                    {annexes.map((annex, index) => (
                        <div key={index} className="flex flex-wrap items-center gap-2">
                            <select
                                className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                                aria-label="Type d'espace annexe"
                                value={annex.type}
                                onChange={(e) => updateAnnex(index, { type: e.target.value as AnnexKey })}
                            >
                                {ANNEXES.filter(
                                    (option) => option.key === annex.type || !usedTypes.includes(option.key),
                                ).map((option) => (
                                    <option key={option.key} value={option.key}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    inputMode="numeric"
                                    aria-label="Surface de l'annexe en m²"
                                    placeholder="m²"
                                    className="h-10 w-24 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                                    value={annex.surface || ''}
                                    onChange={(e) =>
                                        updateAnnex(index, {
                                            surface: Math.max(0, Math.round(Number(e.target.value) || 0)),
                                        })
                                    }
                                />
                                <span className="text-sm text-slate-500">m²</span>
                                <button
                                    type="button"
                                    className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-700"
                                    aria-label="Retirer cet espace"
                                    onClick={() => onAnnexesChange(annexes.filter((_, i) => i !== index))}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {nextType && (
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
                            onClick={() => onAnnexesChange([...annexes, { type: nextType, surface: 0 }])}
                        >
                            <Plus className="h-4 w-4" />
                            Ajouter un espace en plus
                        </button>
                    )}
                    {errors.annexes && <p className="text-sm text-red-500">{errors.annexes}</p>}
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Options et équipements spécifiques
                    </p>
                    {OPTIONS.map((option) => {
                        const quantity = options[option.key] ?? 0;
                        return (
                            <div
                                key={option.key}
                                className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-slate-700"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-800 dark:text-slate-200">{option.label}</p>
                                    {option.detail && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{option.detail}</p>
                                    )}
                                    <p className="text-xs font-medium text-sky-600 dark:text-sky-400">
                                        + {option.price} € / {option.unit}
                                    </p>
                                </div>
                                <div className="flex flex-none items-center gap-2">
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
                                        aria-label={`Retirer : ${option.label}`}
                                        disabled={quantity === 0}
                                        onClick={() => setQuantity(option.key, quantity - 1)}
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="w-6 text-center text-sm font-semibold tabular-nums dark:text-white">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                                        aria-label={`Ajouter : ${option.label}`}
                                        onClick={() => setQuantity(option.key, quantity + 1)}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {surface > 0 && (
                    <div className="rounded-lg bg-sky-50 p-4 text-sm text-slate-700 dark:bg-sky-900/20 dark:text-slate-300">
                        <p>
                            Surface totale : <strong>{result.totalSurface} m²</strong> ·{' '}
                            {result.teamSize} intervenant{result.teamSize > 1 ? 's' : ''} professionnel
                            {result.teamSize > 1 ? 's' : ''} indépendant{result.teamSize > 1 ? 's' : ''}
                        </p>
                        <p className="mt-1">
                            Forfait indicatif : <strong>{formatEuro(result.total)}</strong>
                            <span className="text-slate-500"> — confirmé dans votre devis personnalisé</span>
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
