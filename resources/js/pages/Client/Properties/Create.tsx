import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Home, Save } from 'lucide-react';
import AddressAutocomplete from '@/components/address/AddressAutocomplete';
import PropertyChecklistEditor, {
    type ChecklistSection,
} from '@/components/property/PropertyChecklistEditor';

interface Props {
    propertyTypes: Record<string, string>;
    defaultChecklist: ChecklistSection[];
}

export default function Create({ propertyTypes, defaultChecklist }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        type: '',
        name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        postal_code: '',
        latitude: null as number | null,
        longitude: null as number | null,
        surface_area: '',
        bedrooms: '0',
        bathrooms: '0',
        toilets: '0',
        other_rooms: '0',
        floors: '0',
        external_surface: '',
        access_code: '',
        entry_instructions: '',
        wifi_code: '',
        trash_instructions: '',
        additional_info: '',
        checklist: defaultChecklist,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('client.properties.store'));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Mes logements', href: route('client.properties.index') },
            { title: 'Nouveau logement', href: '#' },
        ]}>
            <Head title="Nouveau logement" />

            <div className="py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={route('client.properties.index')} className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour aux logements
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ajouter un logement</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Renseignez les informations de votre propriété</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Global error banner */}
                        {Object.keys(errors).length > 0 && (
                            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
                                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Veuillez corriger les erreurs suivantes :</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {Object.values(errors).map((error, i) => (
                                        <li key={i} className="text-sm text-red-600 dark:text-red-400">{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Type & Name */}
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <Home className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                    Informations générales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type de logement *</Label>
                                        <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(propertyTypes).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nom (optionnel)</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Ex: Maison de vacances"
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address */}
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="dark:text-white">Adresse</CardTitle>
                                <CardDescription className="dark:text-slate-400">
                                    Commencez à taper pour rechercher une adresse
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address_line1">Adresse *</Label>
                                    <AddressAutocomplete
                                        initialValue={data.address_line1}
                                        placeholder="Rechercher une adresse..."
                                        onAddressSelect={(address) => {
                                            setData(prev => ({
                                                ...prev,
                                                address_line1: address.address_line1,
                                                city: address.city,
                                                postal_code: address.postal_code,
                                                latitude: address.latitude,
                                                longitude: address.longitude,
                                            }));
                                        }}
                                    />
                                    {errors.address_line1 && <p className="text-sm text-red-500">{errors.address_line1}</p>}
                                    {data.latitude && data.longitude && (
                                        <p className="text-xs text-green-600 dark:text-green-400">
                                            ✓ Adresse géolocalisée
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address_line2">Complément d'adresse</Label>
                                    <Input
                                        id="address_line2"
                                        value={data.address_line2}
                                        onChange={(e) => setData('address_line2', e.target.value)}
                                        placeholder="Bâtiment, étage, etc."
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Code postal *</Label>
                                        <Input
                                            id="postal_code"
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value)}
                                            placeholder="75001"
                                            maxLength={5}
                                        />
                                        {errors.postal_code && <p className="text-sm text-red-500">{errors.postal_code}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Ville *</Label>
                                        <Input
                                            id="city"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder="Paris"
                                        />
                                        {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Property Details */}
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="dark:text-white">Caractéristiques</CardTitle>
                                <CardDescription className="dark:text-slate-400">Ces informations nous aident à calculer un devis précis</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="surface_area">Surface (m²) *</Label>
                                        <Input
                                            id="surface_area"
                                            type="number"
                                            min="10"
                                            value={data.surface_area}
                                            onChange={(e) => setData('surface_area', e.target.value)}
                                            placeholder="80"
                                        />
                                        {errors.surface_area && <p className="text-sm text-red-500">{errors.surface_area}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bedrooms">Chambres</Label>
                                        <Input
                                            id="bedrooms"
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={data.bedrooms}
                                            onChange={(e) => setData('bedrooms', e.target.value)}
                                        />
                                        {errors.bedrooms && <p className="text-sm text-red-500">{errors.bedrooms}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bathrooms">Salles de bain</Label>
                                        <Input
                                            id="bathrooms"
                                            type="number"
                                            min="0"
                                            max="20"
                                            value={data.bathrooms}
                                            onChange={(e) => setData('bathrooms', e.target.value)}
                                        />
                                        {errors.bathrooms && <p className="text-sm text-red-500">{errors.bathrooms}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="toilets">Toilettes</Label>
                                        <Input
                                            id="toilets"
                                            type="number"
                                            min="0"
                                            max="20"
                                            value={data.toilets}
                                            onChange={(e) => setData('toilets', e.target.value)}
                                        />
                                        {errors.toilets && <p className="text-sm text-red-500">{errors.toilets}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="other_rooms">Autres pièces</Label>
                                        <Input
                                            id="other_rooms"
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={data.other_rooms}
                                            onChange={(e) => setData('other_rooms', e.target.value)}
                                        />
                                        {errors.other_rooms && <p className="text-sm text-red-500">{errors.other_rooms}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="floors">Étages</Label>
                                        <Input
                                            id="floors"
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={data.floors}
                                            onChange={(e) => setData('floors', e.target.value)}
                                        />
                                        {errors.floors && <p className="text-sm text-red-500">{errors.floors}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="external_surface">Surface extérieure en m² (optionnel)</Label>
                                    <Input
                                        id="external_surface"
                                        type="number"
                                        min="0"
                                        value={data.external_surface}
                                        onChange={(e) => setData('external_surface', e.target.value)}
                                        placeholder="Jardin, terrasse..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Informations supplémentaires */}
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="dark:text-white">Informations pour l'intervenant</CardTitle>
                                <CardDescription className="dark:text-slate-400">Optionnel - Ajoutez des informations utiles si nécessaire</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="additional_info">Informations supplémentaires (optionnel)</Label>
                                    <Textarea
                                        id="additional_info"
                                        value={data.additional_info}
                                        onChange={(e) => setData('additional_info', e.target.value)}
                                        placeholder="Code d'accès, instructions particulières, où trouver les clés, etc."
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="dark:text-white">Checklist du logement</CardTitle>
                                <CardDescription className="dark:text-slate-400">
                                    Personnalisez les tâches à réaliser. Cette checklist sera envoyée
                                    automatiquement à l&apos;intervenant à chaque intervention.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PropertyChecklistEditor
                                    value={data.checklist}
                                    onChange={(checklist) => setData('checklist', checklist)}
                                />
                                {errors.checklist && (
                                    <p className="text-sm text-red-500 mt-2">{errors.checklist}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <div className="flex justify-end gap-4">
                            <Link href={route('client.properties.index')}>
                                <Button type="button" variant="outline" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">Annuler</Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="bg-sky-500 hover:bg-sky-600">
                                <Save className="h-4 w-4 mr-2" />
                                Enregistrer
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
