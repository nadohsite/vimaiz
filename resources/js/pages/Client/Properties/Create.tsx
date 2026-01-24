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

interface Props {
    propertyTypes: Record<string, string>;
}

export default function Create({ propertyTypes }: Props) {
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
                                            value={data.bedrooms}
                                            onChange={(e) => setData('bedrooms', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bathrooms">Salles de bain</Label>
                                        <Input
                                            id="bathrooms"
                                            type="number"
                                            min="0"
                                            value={data.bathrooms}
                                            onChange={(e) => setData('bathrooms', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="toilets">Toilettes</Label>
                                        <Input
                                            id="toilets"
                                            type="number"
                                            min="0"
                                            value={data.toilets}
                                            onChange={(e) => setData('toilets', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="other_rooms">Autres pièces</Label>
                                        <Input
                                            id="other_rooms"
                                            type="number"
                                            min="0"
                                            value={data.other_rooms}
                                            onChange={(e) => setData('other_rooms', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="floors">Étages</Label>
                                        <Input
                                            id="floors"
                                            type="number"
                                            min="0"
                                            value={data.floors}
                                            onChange={(e) => setData('floors', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="external_surface">Surface extérieure (m²)</Label>
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

                        {/* Access & Instructions */}
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="dark:text-white">Accès et instructions</CardTitle>
                                <CardDescription className="dark:text-slate-400">Informations utiles pour l'agent de ménage</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="access_code">Code d'accès</Label>
                                        <Input
                                            id="access_code"
                                            value={data.access_code}
                                            onChange={(e) => setData('access_code', e.target.value)}
                                            placeholder="Digicode, interphone..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="wifi_code">Code Wi-Fi</Label>
                                        <Input
                                            id="wifi_code"
                                            value={data.wifi_code}
                                            onChange={(e) => setData('wifi_code', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="entry_instructions">Instructions d'entrée</Label>
                                    <Textarea
                                        id="entry_instructions"
                                        value={data.entry_instructions}
                                        onChange={(e) => setData('entry_instructions', e.target.value)}
                                        placeholder="Comment accéder au logement..."
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="trash_instructions">Instructions poubelles</Label>
                                    <Textarea
                                        id="trash_instructions"
                                        value={data.trash_instructions}
                                        onChange={(e) => setData('trash_instructions', e.target.value)}
                                        placeholder="Où sont les poubelles..."
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="additional_info">Informations supplémentaires</Label>
                                    <Textarea
                                        id="additional_info"
                                        value={data.additional_info}
                                        onChange={(e) => setData('additional_info', e.target.value)}
                                        placeholder="Toute autre information utile..."
                                        rows={3}
                                    />
                                </div>
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
