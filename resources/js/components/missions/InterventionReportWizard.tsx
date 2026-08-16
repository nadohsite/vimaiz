import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, ChevronLeft } from 'lucide-react';

export interface ReportItem {
    id: string;
    label: string;
    suggests_follow_up?: boolean;
    requires_notes?: boolean;
}

export interface ReportGroup {
    id: string;
    label: string;
    items: ReportItem[];
}

export interface ReportCategory {
    id: string;
    label: string;
    emoji: string;
    groups: ReportGroup[];
}

export interface DraftAnomaly {
    category: string;
    category_label: string;
    type: string;
    label: string;
    notes?: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalog: ReportCategory[];
    checklistProgress: { total: number; checked: number; complete: boolean };
    durationLabel: string;
    processing?: boolean;
    onSubmit: (payload: { nothing_to_report: boolean; anomalies: DraftAnomaly[] }) => void;
}

type Step = 'choice' | 'where' | 'what';

function itemNeedsNotes(item: ReportItem): boolean {
    return Boolean(item.requires_notes) || item.id === 'other' || item.id.startsWith('other_');
}

export default function InterventionReportWizard({
    open,
    onOpenChange,
    catalog,
    checklistProgress,
    durationLabel,
    processing = false,
    onSubmit,
}: Props) {
    const [step, setStep] = useState<Step>('choice');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [anomalies, setAnomalies] = useState<DraftAnomaly[]>([]);

    const category = useMemo(
        () => catalog.find((entry) => entry.id === categoryId) ?? null,
        [catalog, categoryId],
    );

    useEffect(() => {
        if (!open) {
            setStep('choice');
            setCategoryId(null);
            setSelectedTypes([]);
            setNotes('');
            setAnomalies([]);
        }
    }, [open]);

    const selectedItems = useMemo(() => {
        if (!category) {
            return [];
        }
        return category.groups.flatMap((group) =>
            group.items.filter((item) => selectedTypes.includes(`${group.id}:${item.id}`)),
        );
    }, [category, selectedTypes]);

    const needsNotes = selectedItems.some(itemNeedsNotes);

    const handleNothingToReport = () => {
        onSubmit({ nothing_to_report: true, anomalies: [] });
    };

    const handleSelectCategory = (id: string) => {
        setCategoryId(id);
        setSelectedTypes([]);
        setNotes('');
        setStep('what');
    };

    const toggleType = (groupId: string, itemId: string) => {
        const key = `${groupId}:${itemId}`;
        setSelectedTypes((current) =>
            current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key],
        );
    };

    const handleSaveItems = () => {
        if (!category || selectedTypes.length === 0) {
            return;
        }
        if (needsNotes && notes.trim() === '') {
            return;
        }

        const next: DraftAnomaly[] = [];
        category.groups.forEach((group) => {
            group.items.forEach((item) => {
                if (!selectedTypes.includes(`${group.id}:${item.id}`)) {
                    return;
                }
                next.push({
                    category: category.id,
                    category_label: category.label,
                    type: item.id,
                    label: item.label,
                    notes: itemNeedsNotes(item) ? notes.trim() : undefined,
                });
            });
        });

        setAnomalies((current) => [...current, ...next]);
        setCategoryId(null);
        setSelectedTypes([]);
        setNotes('');
        setStep('where');
    };

    const handleFinishWithAnomalies = () => {
        if (anomalies.length === 0) {
            return;
        }
        onSubmit({ nothing_to_report: false, anomalies });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Rapport de fin d&apos;intervention</DialogTitle>
                    <DialogDescription>
                        Checklist : {checklistProgress.checked}/{checklistProgress.total} ✓
                        {durationLabel ? ` · Durée : ${durationLabel}` : ''}
                    </DialogDescription>
                </DialogHeader>

                {step === 'choice' && (
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-slate-800">
                            Avez-vous constaté un problème ?
                        </p>
                        <button
                            type="button"
                            onClick={handleNothingToReport}
                            disabled={processing}
                            className="w-full rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 text-left transition hover:border-emerald-400 hover:bg-emerald-100 disabled:opacity-60"
                        >
                            <p className="text-base font-semibold text-emerald-800">Rien à signaler</p>
                            <p className="mt-1 text-sm text-emerald-700">
                                Le rapport est généré automatiquement. Rien d&apos;autre à faire.
                            </p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('where')}
                            disabled={processing}
                            className="w-full rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-left transition hover:border-amber-400 hover:bg-amber-100 disabled:opacity-60"
                        >
                            <p className="text-base font-semibold text-amber-800">Oui, signaler un élément</p>
                            <p className="mt-1 text-sm text-amber-700">
                                Quelques choix, sans rédaction obligatoire.
                            </p>
                        </button>
                    </div>
                )}

                {step === 'where' && (
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => setStep(anomalies.length > 0 ? 'where' : 'choice')}
                            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700"
                            hidden={anomalies.length > 0}
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Retour
                        </button>

                        {anomalies.length > 0 && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-800">
                                    Déjà signalé
                                </p>
                                <ul className="space-y-1">
                                    {anomalies.map((anomaly, index) => (
                                        <li key={`${anomaly.category}-${anomaly.type}-${index}`} className="text-sm text-amber-900">
                                            {anomaly.category_label} — {anomaly.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <p className="text-sm font-medium text-slate-800">
                            {anomalies.length > 0 ? 'Ajouter un autre élément ?' : 'Où ?'}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {catalog.map((entry) => (
                                <button
                                    key={entry.id}
                                    type="button"
                                    onClick={() => handleSelectCategory(entry.id)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:border-sky-400 hover:bg-sky-50"
                                >
                                    <span className="mr-1">{entry.emoji}</span>
                                    {entry.label}
                                </button>
                            ))}
                        </div>

                        {anomalies.length > 0 && (
                            <Button
                                onClick={handleFinishWithAnomalies}
                                disabled={processing}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                {processing ? 'Envoi du rapport…' : 'Terminer l\'intervention'}
                            </Button>
                        )}
                    </div>
                )}

                {step === 'what' && category && (
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => {
                                setStep('where');
                                setCategoryId(null);
                                setSelectedTypes([]);
                                setNotes('');
                            }}
                            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700"
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Retour
                        </button>
                        <p className="text-sm font-medium text-slate-800">
                            {category.emoji} {category.label} — quoi ?
                        </p>
                        <div className="space-y-4">
                            {category.groups.map((group) => (
                                <div key={group.id}>
                                    {category.groups.length > 1 && (
                                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                                            {group.label}
                                        </p>
                                    )}
                                    <ul className="space-y-1.5">
                                        {group.items.map((item) => {
                                            const key = `${group.id}:${item.id}`;
                                            const checked = selectedTypes.includes(key);
                                            return (
                                                <li key={key}>
                                                    <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-sm hover:border-sky-300">
                                                        <input
                                                            type="checkbox"
                                                            className="mt-0.5 h-4 w-4"
                                                            checked={checked}
                                                            onChange={() => toggleType(group.id, item.id)}
                                                        />
                                                        <span>{item.label}</span>
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        {needsNotes && (
                            <div>
                                <p className="mb-1 text-sm font-medium text-slate-700">
                                    Décrivez brièvement le problème
                                </p>
                                <Textarea
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    rows={3}
                                    placeholder="Quelques mots suffisent…"
                                />
                            </div>
                        )}
                        <Button
                            onClick={handleSaveItems}
                            disabled={
                                selectedTypes.length === 0 || (needsNotes && notes.trim() === '')
                            }
                            className="w-full bg-sky-600 hover:bg-sky-700"
                        >
                            Enregistrer
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
