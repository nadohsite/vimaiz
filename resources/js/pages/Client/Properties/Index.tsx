import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Plus, MapPin, Maximize, BedDouble, Bath, Edit, Trash2, Eye } from 'lucide-react';

interface Property {
    id: number;
    name: string | null;
    type: string;
    type_label: string;
    city: string;
    postal_code: string;
    address_line1: string;
    surface_area: number;
    bedrooms: number;
    bathrooms: number;
    is_active: boolean;
    active_requests_count: number;
    created_at: string;
}

interface Props {
    properties: Property[];
    propertyTypes: Record<string, string>;
}

export default function Index({ properties, propertyTypes }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce logement ?')) {
            router.delete(route('client.properties.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Mes logements', href: route('client.properties.index') }]}>
            <Head title="Mes logements" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes logements</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez vos propriétés pour vos demandes d'intervention</p>
                        </div>
                        <Link href={route('client.properties.create')}>
                            <Button className="bg-sky-500 hover:bg-sky-600">
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un logement
                            </Button>
                        </Link>
                    </div>

                    {/* Properties Grid */}
                    {properties.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {properties.map((property) => (
                                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700">
                                    <CardHeader className="bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-slate-700 dark:to-slate-700 pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-lg">
                                                    <Home className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg dark:text-white">
                                                        {property.name || `${property.type_label}`}
                                                    </CardTitle>
                                                    <CardDescription className="flex items-center gap-1 mt-1 dark:text-slate-400">
                                                        <MapPin className="h-3 w-3" />
                                                        {property.city}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Badge variant={property.is_active ? "default" : "secondary"}>
                                                {property.is_active ? 'Actif' : 'Inactif'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{property.address_line1}</p>
                                        
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                                            <span className="flex items-center gap-1">
                                                <Maximize className="h-4 w-4" />
                                                {property.surface_area} m²
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <BedDouble className="h-4 w-4" />
                                                {property.bedrooms} ch.
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Bath className="h-4 w-4" />
                                                {property.bathrooms} sdb
                                            </span>
                                        </div>

                                        {property.active_requests_count > 0 && (
                                            <p className="text-xs text-sky-600 dark:text-sky-400 mb-4">
                                                {property.active_requests_count} demande(s) en cours
                                            </p>
                                        )}

                                        <div className="flex gap-2 pt-2 border-t dark:border-slate-600">
                                            <Link href={route('client.properties.show', property.id)} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Voir
                                                </Button>
                                            </Link>
                                            <Link href={route('client.properties.edit', property.id)}>
                                                <Button variant="outline" size="sm" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleDelete(property.id)}
                                                disabled={property.active_requests_count > 0}
                                                className="text-red-500 hover:text-red-700 dark:border-slate-600 dark:hover:bg-slate-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-12 dark:bg-slate-800 dark:border-slate-700">
                            <CardContent>
                                <div className="mx-auto w-16 h-16 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center mb-4">
                                    <Home className="h-8 w-8 text-sky-500 dark:text-sky-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    Aucun logement enregistré
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">
                                    Ajoutez votre premier logement pour pouvoir programmer une intervention.
                                </p>
                                <Link href={route('client.properties.create')}>
                                    <Button className="bg-sky-500 hover:bg-sky-600">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Ajouter un logement
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
