import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Home, Save } from 'lucide-react';
import AddressAutocomplete from '@/components/address/AddressAutocomplete';

interface Property {
    id: number;
    type: string;
    name: string | null;
    address_line1: string;
    address_line2: string | null;
    city: string;
    postal_code: string;
    latitude: number | null;
    longitude: number | null;
    surface_area: number;
    bedrooms: number;
    bathrooms: number;
    toilets: number;
    other_rooms: number;
    floors: number;
    external_surface: number | null;
    access_code: string | null;
    entry_instructions: string | null;
    wifi_code: string | null;
    trash_instructions: string | null;
    additional_info: string | null;
    is_active: boolean;
}

interface Props {
    property: Property;
    propertyTypes: Record<string, string>;
}

export default function Edit({ property, propertyTypes }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        type: property.type,
        name: property.name || '',
        address_line1: property.address_line1,
        address_line2: property.address_line2 || '',
        city: property.city,
        postal_code: property.postal_code,
        latitude: property.latitude,
        longitude: property.longitude,
        surface_area: String(property.surface_area),
        bedrooms: String(property.bedrooms),
        bathrooms: String(property.bathrooms),
        toilets: String(property.toilets),
        other_rooms: String(property.other_rooms),
        floors: String(property.floors),
        external_surface: property.external_surface ? String(property.external_surface) : '',
        access_code: property.access_code || '',
        entry_instructions: property.entry_instructions || '',
        wifi_code: property.wifi_code || '',
        trash_instructions: property.trash_instructions || '',
        additional_info: property.additional_info || '',
        is_active: property.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('client.properties.update', property.id));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Mes logements', href: route('client.properties.index') },
            { title: property.name || 'Modifier', href: '#' },
        ]}>
            <Head title="Modifier le logement" />

            <div className="py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link href={route('client.properties.show', property.id)} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour au logement
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900">Modifier le logement</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statut</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="is_active">Logement actif</Label>
                                        <p className="text-sm text-slate-500">
                                            Désactiver pour masquer ce logement des nouvelles demandes
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Type & Name */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Home className="h-5 w-5 text-sky-500" />
                                    Informations générales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type de logement *</Label>
                                        <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
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
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Adresse</CardTitle>
                                <CardDescription>
                                    Modifiez l'adresse en recherchant une nouvelle
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
                                        <p className="text-xs text-green-600">
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
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Code postal *</Label>
                                        <Input
                                            id="postal_code"
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value)}
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
                                        />
                                        {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Property Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Caractéristiques</CardTitle>
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
                                <CardTitle className="dark:text-white">Informations pour l'agent de ménage</CardTitle>
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

                        {/* Submit */}
                        <div className="flex justify-end gap-4">
                            <Link href={route('client.properties.show', property.id)}>
                                <Button type="button" variant="outline">Annuler</Button>
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
