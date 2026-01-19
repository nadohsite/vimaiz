import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Home, MapPin, User, Camera, Clock, CheckCircle } from 'lucide-react';

interface Property {
    id: number;
    name: string | null;
    type_label: string;
    city: string;
    address_line1: string;
    postal_code: string;
}

interface Agent {
    id: number;
    name: string;
}

interface Photo {
    id: number;
    type: 'before' | 'after';
    path: string;
    description: string | null;
    room: string | null;
}

interface Mission {
    id: number;
    mission_number: string;
    scheduled_at: string;
    started_at: string | null;
    completed_at: string | null;
    duration_hours: number;
    total_price: number;
    status: string;
    status_label: string;
    property: Property;
    agent: Agent | null;
    photos: Photo[];
}

interface Props {
    mission: Mission;
}

export default function Show({ mission }: Props) {
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending_agent: 'bg-yellow-100 text-yellow-800',
            agent_accepted: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-sky-100 text-sky-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const beforePhotos = mission.photos.filter(p => p.type === 'before');
    const afterPhotos = mission.photos.filter(p => p.type === 'after');

    return (
        <AppLayout breadcrumbs={[
            { title: 'Mes missions', href: route('client.missions.index') },
            { title: mission.mission_number, href: '#' },
        ]}>
            <Head title={`Mission ${mission.mission_number}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={route('client.missions.index')} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour aux missions
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        {mission.mission_number}
                                    </h1>
                                    <Badge className={getStatusColor(mission.status)}>
                                        {mission.status_label}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Status Timeline */}
                            {mission.status === 'completed' && (
                                <Card className="bg-green-50 border-green-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-8 w-8 text-green-500" />
                                            <div>
                                                <h3 className="font-semibold text-green-800">Mission terminée</h3>
                                                <p className="text-sm text-green-700">
                                                    Terminée le {mission.completed_at && new Date(mission.completed_at).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Photos Before */}
                            {beforePhotos.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Camera className="h-5 w-5 text-sky-500" />
                                            Photos avant intervention
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {beforePhotos.map((photo) => (
                                                <div key={photo.id} className="relative group">
                                                    <img
                                                        src={`/storage/${photo.path}`}
                                                        alt={photo.description || 'Photo avant'}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    {photo.room && (
                                                        <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                                                            {photo.room}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Photos After */}
                            {afterPhotos.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Camera className="h-5 w-5 text-green-500" />
                                            Photos après intervention
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {afterPhotos.map((photo) => (
                                                <div key={photo.id} className="relative group">
                                                    <img
                                                        src={`/storage/${photo.path}`}
                                                        alt={photo.description || 'Photo après'}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    {photo.room && (
                                                        <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                                                            {photo.room}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* No Photos Yet */}
                            {mission.photos.length === 0 && (
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <Camera className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500">
                                            Les photos seront disponibles une fois la mission commencée.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Agent */}
                            {mission.agent && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <User className="h-4 w-4 text-sky-500" />
                                            Agent
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                                                <User className="h-6 w-6 text-sky-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{mission.agent.name}</p>
                                                <p className="text-sm text-slate-500">Agent VIMAIZ</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Property */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Home className="h-4 w-4 text-sky-500" />
                                        Logement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium">{mission.property.name || mission.property.type_label}</p>
                                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        {mission.property.address_line1}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {mission.property.postal_code} {mission.property.city}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Schedule */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Calendar className="h-4 w-4 text-sky-500" />
                                        Planification
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Date</span>
                                        <span className="font-medium">
                                            {new Date(mission.scheduled_at).toLocaleDateString('fr-FR', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Heure</span>
                                        <span className="font-medium">
                                            {new Date(mission.scheduled_at).toLocaleTimeString('fr-FR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Durée</span>
                                        <span className="font-medium">{mission.duration_hours}h</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Price */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Montant</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold text-slate-900">{mission.total_price} MAD</p>
                                    <p className="text-xs text-slate-500 mt-1">Payé</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
