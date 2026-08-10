import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Home, Calendar, ClipboardList, FileText, Send } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import type { ChecklistSection } from '@/components/property/PropertyChecklistEditor';

interface Property {
    id: number;
    name: string | null;
    type: string;
    city: string;
    surface_area: number;
    checklist: ChecklistSection[];
}

interface Props {
    properties: Property[];
    minDate: string;
    maxDate: string;
    selectedPropertyId?: string | null;
}

function collectIds(checklist: ChecklistSection[]) {
    return {
        sectionIds: checklist.map((section) => section.id),
        itemIds: checklist.flatMap((section) => section.items.map((item) => item.id)),
    };
}

export default function Create({ properties, minDate, maxDate, selectedPropertyId }: Props) {
    const initialPropertyId = selectedPropertyId ? String(selectedPropertyId) : '';
    const initialProperty = properties.find((p) => p.id === Number(initialPropertyId));
    const initialIds = collectIds(initialProperty?.checklist ?? []);

    const { data, setData, post, processing, errors } = useForm({
        property_id: initialPropertyId,
        scheduled_date: '',
        scheduled_time: '09:00',
        special_instructions: '',
        checklist_section_ids: initialIds.sectionIds,
        checklist_item_ids: initialIds.itemIds,
    });

    const selectedProperty = useMemo(
        () => properties.find((p) => p.id === Number(data.property_id)),
        [properties, data.property_id],
    );

    const checklist = selectedProperty?.checklist ?? [];

    useEffect(() => {
        if (!selectedProperty) {
            setData((prev) => ({
                ...prev,
                checklist_section_ids: [],
                checklist_item_ids: [],
            }));
            return;
        }

        const ids = collectIds(selectedProperty.checklist);
        setData((prev) => ({
            ...prev,
            checklist_section_ids: ids.sectionIds,
            checklist_item_ids: ids.itemIds,
        }));
        // Reset axes only when the selected property changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.property_id]);

    const handlePropertyChange = (value: string) => {
        setData('property_id', value);
    };

    const isSectionSelected = (sectionId: string) => data.checklist_section_ids.includes(sectionId);
    const isItemSelected = (itemId: string) => data.checklist_item_ids.includes(itemId);

    const toggleSection = (section: ChecklistSection, checked: boolean) => {
        const sectionItemIds = section.items.map((item) => item.id);

        if (checked) {
            setData((prev) => ({
                ...prev,
                checklist_section_ids: [...new Set([...prev.checklist_section_ids, section.id])],
                checklist_item_ids: [...new Set([...prev.checklist_item_ids, ...sectionItemIds])],
            }));
            return;
        }

        setData((prev) => ({
            ...prev,
            checklist_section_ids: prev.checklist_section_ids.filter((id) => id !== section.id),
            checklist_item_ids: prev.checklist_item_ids.filter((id) => !sectionItemIds.includes(id)),
        }));
    };

    const toggleItem = (section: ChecklistSection, itemId: string, checked: boolean) => {
        if (checked) {
            setData((prev) => ({
                ...prev,
                checklist_section_ids: [...new Set([...prev.checklist_section_ids, section.id])],
                checklist_item_ids: [...new Set([...prev.checklist_item_ids, itemId])],
            }));
            return;
        }

        setData((prev) => {
            const nextItemIds = prev.checklist_item_ids.filter((id) => id !== itemId);
            const remainingInSection = section.items.some((item) => nextItemIds.includes(item.id));

            return {
                ...prev,
                checklist_item_ids: nextItemIds,
                checklist_section_ids: remainingInSection
                    ? prev.checklist_section_ids
                    : prev.checklist_section_ids.filter((id) => id !== section.id),
            };
        });
    };

    const selectAllAxes = () => {
        const ids = collectIds(checklist);
        setData((prev) => ({
            ...prev,
            checklist_section_ids: ids.sectionIds,
            checklist_item_ids: ids.itemIds,
        }));
    };

    const clearAllAxes = () => {
        setData((prev) => ({
            ...prev,
            checklist_section_ids: [],
            checklist_item_ids: [],
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('client.requests.store'));
    };

    const selectedAxesCount = data.checklist_section_ids.length;
    const selectedTasksCount = data.checklist_item_ids.length;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Mes demandes', href: route('client.requests.index') },
                { title: 'Nouvelle intervention', href: '#' },
            ]}
        >
            <Head title="Nouvelle intervention" />

            <div className="py-8">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link
                            href={route('client.requests.index')}
                            className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour aux demandes
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Nouvelle intervention
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Programmez votre prochaine intervention
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <Home className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                    Bien
                                </CardTitle>
                                <CardDescription className="dark:text-slate-400">
                                    Sélectionnez le bien à nettoyer
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="property_id">Bien *</Label>
                                    <Select value={data.property_id} onValueChange={handlePropertyChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un bien..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {properties.map((property) => (
                                                <SelectItem key={property.id} value={String(property.id)}>
                                                    {property.name || property.type} - {property.city} (
                                                    {property.surface_area} m²)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.property_id && (
                                        <p className="text-sm text-red-500">{errors.property_id}</p>
                                    )}
                                </div>

                                {properties.length === 0 && (
                                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                            Vous n&apos;avez pas encore de bien.{' '}
                                            <Link
                                                href={route('client.properties.create')}
                                                className="font-medium underline"
                                            >
                                                Ajouter un bien
                                            </Link>
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {selectedProperty && checklist.length > 0 && (
                            <Card className="dark:bg-slate-800 dark:border-slate-700">
                                <CardHeader>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                                <ClipboardList className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                                Axes d&apos;intervention
                                            </CardTitle>
                                            <CardDescription className="dark:text-slate-400 mt-1">
                                                Choisissez les zones et tâches à réaliser pour cette
                                                intervention
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={selectAllAxes}
                                                className="dark:border-slate-600"
                                            >
                                                Tout sélectionner
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearAllAxes}
                                            >
                                                Tout retirer
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {selectedAxesCount} axe{selectedAxesCount > 1 ? 's' : ''} ·{' '}
                                        {selectedTasksCount} tâche{selectedTasksCount > 1 ? 's' : ''}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {checklist.map((section) => {
                                        const sectionSelected = isSectionSelected(section.id);
                                        const selectedInSection = section.items.filter((item) =>
                                            isItemSelected(item.id),
                                        ).length;

                                        return (
                                            <div
                                                key={section.id}
                                                className={`rounded-lg border p-4 transition-colors ${
                                                    sectionSelected
                                                        ? 'border-sky-200 bg-sky-50/50 dark:border-sky-800 dark:bg-sky-900/20'
                                                        : 'border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        id={`section-${section.id}`}
                                                        checked={sectionSelected}
                                                        onCheckedChange={(checked) =>
                                                            toggleSection(section, checked === true)
                                                        }
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <label
                                                            htmlFor={`section-${section.id}`}
                                                            className="flex items-center gap-2 cursor-pointer font-medium text-slate-900 dark:text-white"
                                                        >
                                                            <span>{section.emoji}</span>
                                                            <span>{section.title}</span>
                                                            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                                                                ({selectedInSection}/{section.items.length})
                                                            </span>
                                                        </label>

                                                        <div className="mt-3 space-y-2 pl-1">
                                                            {section.items.map((item) => (
                                                                <div
                                                                    key={item.id}
                                                                    className="flex items-start gap-2"
                                                                >
                                                                    <Checkbox
                                                                        id={`item-${item.id}`}
                                                                        checked={isItemSelected(item.id)}
                                                                        onCheckedChange={(checked) =>
                                                                            toggleItem(
                                                                                section,
                                                                                item.id,
                                                                                checked === true,
                                                                            )
                                                                        }
                                                                        className="mt-0.5"
                                                                    />
                                                                    <label
                                                                        htmlFor={`item-${item.id}`}
                                                                        className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer leading-snug"
                                                                    >
                                                                        {item.label}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {(errors.checklist_section_ids || errors.checklist_item_ids) && (
                                        <p className="text-sm text-red-500">
                                            {errors.checklist_section_ids || errors.checklist_item_ids}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <Calendar className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                    Date et heure d&apos;intervention
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled_date">Date *</Label>
                                        <Input
                                            id="scheduled_date"
                                            type="date"
                                            min={minDate}
                                            max={maxDate}
                                            value={data.scheduled_date}
                                            onChange={(e) => setData('scheduled_date', e.target.value)}
                                        />
                                        {errors.scheduled_date && (
                                            <p className="text-sm text-red-500">{errors.scheduled_date}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled_time">Heure de début *</Label>
                                        <Select
                                            value={data.scheduled_time}
                                            onValueChange={(value) => setData('scheduled_time', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[
                                                    '08:00',
                                                    '09:00',
                                                    '10:00',
                                                    '11:00',
                                                    '12:00',
                                                    '13:00',
                                                    '14:00',
                                                    '15:00',
                                                    '16:00',
                                                    '17:00',
                                                ].map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.scheduled_time && (
                                            <p className="text-sm text-red-500">{errors.scheduled_time}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="dark:text-white">Instructions particulières</CardTitle>
                                <CardDescription className="dark:text-slate-400">
                                    Précisez vos attentes pour cette intervention
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    id="special_instructions"
                                    value={data.special_instructions}
                                    onChange={(e) => setData('special_instructions', e.target.value)}
                                    placeholder="Ex: Insister sur la salle de bain, ne pas toucher au bureau..."
                                    rows={4}
                                />
                                {errors.special_instructions && (
                                    <p className="text-sm text-red-500">{errors.special_instructions}</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-900/30 dark:to-cyan-900/30 border-sky-200 dark:border-sky-800">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        <strong>Devis personnalisé</strong> : Nous vous enverrons un devis
                                        détaillé sous 24h après réception de votre demande.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Link href={route('client.requests.index')}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    Annuler
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    !data.property_id ||
                                    data.checklist_section_ids.length === 0 ||
                                    data.checklist_item_ids.length === 0
                                }
                                className="bg-sky-500 hover:bg-sky-600"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Envoyer la demande
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
