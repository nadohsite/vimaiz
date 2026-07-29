import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

export type ChecklistItem = {
    id: string;
    label: string;
};

export type ChecklistSection = {
    id: string;
    title: string;
    emoji?: string;
    items: ChecklistItem[];
};

type Props = {
    value: ChecklistSection[];
    onChange: (sections: ChecklistSection[]) => void;
};

function newId(prefix: string) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function PropertyChecklistEditor({ value, onChange }: Props) {
    const updateSection = (sectionIndex: number, patch: Partial<ChecklistSection>) => {
        const next = value.map((section, index) =>
            index === sectionIndex ? { ...section, ...patch } : section,
        );
        onChange(next);
    };

    const updateItem = (sectionIndex: number, itemIndex: number, label: string) => {
        const next = value.map((section, sIndex) => {
            if (sIndex !== sectionIndex) {
                return section;
            }
            return {
                ...section,
                items: section.items.map((item, iIndex) =>
                    iIndex === itemIndex ? { ...item, label } : item,
                ),
            };
        });
        onChange(next);
    };

    const addItem = (sectionIndex: number) => {
        const next = value.map((section, index) => {
            if (index !== sectionIndex) {
                return section;
            }
            return {
                ...section,
                items: [...section.items, { id: newId('item'), label: '' }],
            };
        });
        onChange(next);
    };

    const removeItem = (sectionIndex: number, itemIndex: number) => {
        const next = value
            .map((section, index) => {
                if (index !== sectionIndex) {
                    return section;
                }
                return {
                    ...section,
                    items: section.items.filter((_, i) => i !== itemIndex),
                };
            })
            .filter((section) => section.items.length > 0);
        onChange(next);
    };

    const removeSection = (sectionIndex: number) => {
        onChange(value.filter((_, index) => index !== sectionIndex));
    };

    const addSection = () => {
        onChange([
            ...value,
            {
                id: newId('section'),
                title: 'Nouvelle section',
                emoji: '✅',
                items: [{ id: newId('item'), label: '' }],
            },
        ]);
    };

    return (
        <div className="space-y-4">
            {value.map((section, sectionIndex) => (
                <div
                    key={section.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/70 dark:bg-slate-900/40 p-4"
                >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Input
                            value={section.emoji ?? ''}
                            onChange={(e) => updateSection(sectionIndex, { emoji: e.target.value })}
                            className="w-14 text-center dark:bg-slate-800 dark:border-slate-600"
                            aria-label="Emoji de section"
                            maxLength={8}
                        />
                        <Input
                            value={section.title}
                            onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                            className="flex-1 min-w-[160px] font-medium dark:bg-slate-800 dark:border-slate-600"
                            aria-label="Titre de section"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSection(sectionIndex)}
                            className="text-slate-500 hover:text-red-600"
                            aria-label="Supprimer la section"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <ul className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                            <li key={item.id} className="flex items-center gap-2">
                                <span className="text-slate-400 text-sm w-5 shrink-0">☐</span>
                                <Input
                                    value={item.label}
                                    onChange={(e) =>
                                        updateItem(sectionIndex, itemIndex, e.target.value)
                                    }
                                    placeholder="Tâche à réaliser"
                                    className="dark:bg-slate-800 dark:border-slate-600"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(sectionIndex, itemIndex)}
                                    className="text-slate-500 hover:text-red-600"
                                    aria-label="Supprimer la tâche"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addItem(sectionIndex)}
                        className="mt-3 dark:border-slate-600"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter une tâche
                    </Button>
                </div>
            ))}

            <Button type="button" variant="outline" onClick={addSection} className="dark:border-slate-600">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une section
            </Button>
        </div>
    );
}
