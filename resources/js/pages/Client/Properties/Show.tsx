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
    checklist: Array<{
        id: string;
        title: string;
        emoji?: string;
        items: Array<{ id: string; label: string }>;
    }> | null;
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
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            quote_sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            quote_accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
            assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            in_progress: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Mes biens', href: route('client.properties.index') },
            { title: property.name || property.type_label, href: '#' },
        ]}>
            <Head title={property.name || property.type_label} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={route('client.properties.index')} className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour aux biens
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-sky-100 dark:bg-sky-900/50 rounded-xl">
                                    <Home className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {property.name || property.type_label}
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {property.address_line1}, {property.postal_code} {property.city}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('client.requests.create', { property_id: property.id })}>
                                    <Button className="bg-sky-500 hover:bg-sky-600">
                                        <CalendarPlus className="h-4 w-4 mr-2" />
                                        Programmer une intervention
                                    </Button>
                                </Link>
                                <Link href={route('client.properties.edit', property.id)}>
                                    <Button variant="outline" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
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
                            <Card className="dark:bg-slate-800 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">Caractéristiques</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                            <Maximize className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                            <div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Surface</p>
                                                <p className="font-semibold dark:text-white">{property.surface_area} m²</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                            <BedDouble className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                            <div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Chambres</p>
                                                <p className="font-semibold dark:text-white">{property.bedrooms}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                            <Bath className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                            <div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Salles de bain</p>
                                                <p className="font-semibold dark:text-white">{property.bathrooms}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {(property.toilets > 0 || property.other_rooms > 0 || property.floors > 0) && (
                                        <div className="mt-4 pt-4 border-t dark:border-slate-600 grid gap-2 text-sm dark:text-slate-300">
                                            {property.toilets > 0 && (
                                                <p><span className="text-slate-500 dark:text-slate-400">Toilettes:</span> {property.toilets}</p>
                                            )}
                                            {property.other_rooms > 0 && (
                                                <p><span className="text-slate-500 dark:text-slate-400">Autres pièces:</span> {property.other_rooms}</p>
                                            )}
                                            {property.floors > 0 && (
                                                <p><span className="text-slate-500 dark:text-slate-400">Étages:</span> {property.floors}</p>
                                            )}
                                            {property.external_surface && (
                                                <p><span className="text-slate-500 dark:text-slate-400">Surface extérieure:</span> {property.external_surface} m²</p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {property.checklist && property.checklist.length > 0 && (
                                <Card className="dark:bg-slate-800 dark:border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="dark:text-white">Checklist du bien</CardTitle>
                                        <CardDescription className="dark:text-slate-400">
                                            Remise à l&apos;intervenant automatiquement à chaque intervention
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {property.checklist.map((section) => (
                                            <div key={section.id}>
                                                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                                                    {section.emoji ? `${section.emoji} ` : ''}
                                                    {section.title}
                                                </h4>
                                                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                                    {section.items.map((item) => (
                                                        <li key={item.id} className="flex gap-2">
                                                            <span className="text-slate-400">☐</span>
                                                            <span>{item.label}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Recent Requests */}
                            <Card className="dark:bg-slate-800 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">Demandes récentes</CardTitle>
                                    <CardDescription className="dark:text-slate-400">Historique des demandes d'intervention</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {property.service_requests?.length > 0 ? (
                                        <div className="space-y-3">
                                            {property.service_requests.map((request) => (
                                                <Link 
                                                    key={request.id} 
                                                    href={route('client.requests.show', request.id)}
                                                    className="flex items-center justify-between p-3 rounded-lg border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="h-4 w-4 text-slate-400" />
                                                        <div>
                                                            <p className="font-medium text-sm dark:text-white">{request.request_number}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                {new Date(request.scheduled_date).toLocaleDateString('fr-FR')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {request.quote && (
                                                            <span className="text-sm font-medium dark:text-white">{request.quote.final_price} €</span>
                                                        )}
                                                        <Badge className={getStatusColor(request.status)}>
                                                            {request.status_label}
                                                        </Badge>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                                            Aucune demande pour ce bien
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Informations pour l'intervenant */}
                        <div className="space-y-6">
                            <Card className="dark:bg-slate-800 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Key className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                        Informations pour l'intervenant
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {property.additional_info && (
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Informations supplémentaires</p>
                                            <p className="text-sm dark:text-slate-300 whitespace-pre-line">{property.additional_info}</p>
                                        </div>
                                    )}
                                    {!property.additional_info && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
                                            Aucune information supplémentaire
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-slate-800 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">Adresse complète</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm dark:text-slate-300">
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
