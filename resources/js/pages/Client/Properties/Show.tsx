import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, MapPin, Maximize, BedDouble, Bath, Edit, Key, Wifi, Trash2, CalendarPlus, Clock } from 'lucide-react';

interface ServiceRequest {
    id: number;
    request_number: string;
    scheduled_date: string;
    status: string;
    status_label: string;
    quote?: { final_price: number };
}

interface Mission {
    id: number;
    mission_number: string;
    scheduled_at: string;
    status: string;
    status_label: string;
}

interface Property {
    id: number;
    name: string | null;
    type: string;
    type_label: string;
    city: string;
    postal_code: string;
    address_line1: string;
    address_line2: string | null;
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
    service_requests: ServiceRequest[];
    missions: Mission[];
}

interface Props {
    property: Property;
    propertyTypes: Record<string, string>;
}

export default function Show({ property }: Props) {
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            quote_sent: 'bg-blue-100 text-blue-800',
            quote_accepted: 'bg-green-100 text-green-800',
            paid: 'bg-emerald-100 text-emerald-800',
            assigned: 'bg-purple-100 text-purple-800',
            in_progress: 'bg-sky-100 text-sky-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Mes logements', href: route('client.properties.index') },
            { title: property.name || property.type_label, href: '#' },
        ]}>
            <Head title={property.name || property.type_label} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={route('client.properties.index')} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour aux logements
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-sky-100 rounded-xl">
                                    <Home className="h-8 w-8 text-sky-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        {property.name || property.type_label}
                                    </h1>
                                    <p className="text-slate-500 flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {property.address_line1}, {property.postal_code} {property.city}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('client.requests.create', { property_id: property.id })}>
                                    <Button className="bg-sky-500 hover:bg-sky-600">
                                        <CalendarPlus className="h-4 w-4 mr-2" />
                                        Demander un ménage
                                    </Button>
                                </Link>
                                <Link href={route('client.properties.edit', property.id)}>
                                    <Button variant="outline">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Modifier
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Characteristics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Caractéristiques</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                            <Maximize className="h-5 w-5 text-sky-500" />
                                            <div>
                                                <p className="text-sm text-slate-500">Surface</p>
                                                <p className="font-semibold">{property.surface_area} m²</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                            <BedDouble className="h-5 w-5 text-sky-500" />
                                            <div>
                                                <p className="text-sm text-slate-500">Chambres</p>
                                                <p className="font-semibold">{property.bedrooms}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                            <Bath className="h-5 w-5 text-sky-500" />
                                            <div>
                                                <p className="text-sm text-slate-500">Salles de bain</p>
                                                <p className="font-semibold">{property.bathrooms}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {(property.toilets > 0 || property.other_rooms > 0 || property.floors > 0) && (
                                        <div className="mt-4 pt-4 border-t grid gap-2 text-sm">
                                            {property.toilets > 0 && (
                                                <p><span className="text-slate-500">Toilettes:</span> {property.toilets}</p>
                                            )}
                                            {property.other_rooms > 0 && (
                                                <p><span className="text-slate-500">Autres pièces:</span> {property.other_rooms}</p>
                                            )}
                                            {property.floors > 0 && (
                                                <p><span className="text-slate-500">Étages:</span> {property.floors}</p>
                                            )}
                                            {property.external_surface && (
                                                <p><span className="text-slate-500">Surface extérieure:</span> {property.external_surface} m²</p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Requests */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Demandes récentes</CardTitle>
                                    <CardDescription>Historique des demandes de ménage</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {property.service_requests?.length > 0 ? (
                                        <div className="space-y-3">
                                            {property.service_requests.map((request) => (
                                                <Link 
                                                    key={request.id} 
                                                    href={route('client.requests.show', request.id)}
                                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="h-4 w-4 text-slate-400" />
                                                        <div>
                                                            <p className="font-medium text-sm">{request.request_number}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {new Date(request.scheduled_date).toLocaleDateString('fr-FR')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {request.quote && (
                                                            <span className="text-sm font-medium">{request.quote.final_price} MAD</span>
                                                        )}
                                                        <Badge className={getStatusColor(request.status)}>
                                                            {request.status_label}
                                                        </Badge>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-slate-500 py-4">
                                            Aucune demande pour ce logement
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Access Info */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="h-5 w-5 text-sky-500" />
                                        Accès
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {property.access_code && (
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Code d'accès</p>
                                            <p className="font-mono bg-slate-100 px-2 py-1 rounded">{property.access_code}</p>
                                        </div>
                                    )}
                                    {property.wifi_code && (
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Wifi className="h-3 w-3" /> Wi-Fi
                                            </p>
                                            <p className="font-mono bg-slate-100 px-2 py-1 rounded">{property.wifi_code}</p>
                                        </div>
                                    )}
                                    {property.entry_instructions && (
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Instructions d'entrée</p>
                                            <p className="text-sm">{property.entry_instructions}</p>
                                        </div>
                                    )}
                                    {property.trash_instructions && (
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Trash2 className="h-3 w-3" /> Poubelles
                                            </p>
                                            <p className="text-sm">{property.trash_instructions}</p>
                                        </div>
                                    )}
                                    {property.additional_info && (
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Informations</p>
                                            <p className="text-sm">{property.additional_info}</p>
                                        </div>
                                    )}
                                    {!property.access_code && !property.wifi_code && !property.entry_instructions && (
                                        <p className="text-sm text-slate-500 text-center py-2">
                                            Aucune information d'accès renseignée
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Adresse complète</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm">
                                    <p>{property.address_line1}</p>
                                    {property.address_line2 && <p>{property.address_line2}</p>}
                                    <p>{property.postal_code} {property.city}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
