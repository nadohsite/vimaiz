import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Home, MapPin, User, Camera, Clock, CheckCircle, Download, FileText } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { useState } from 'react';

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

interface Invoice {
    id: number;
    invoice_number: string;
    total: number;
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
    photos?: Photo[];
    invoice?: Invoice | null;
}

interface Props {
    mission: Mission;
    canDownloadInvoice: boolean;
}

export default function Show({ mission, canDownloadInvoice }: Props) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxImages, setLightboxImages] = useState<{ src: string; alt?: string; caption?: string }[]>([]);

    const openLightbox = (photos: Photo[], index: number, type: string) => {
        const images = photos.map((p, i) => ({
            src: `/storage/${p.path}`,
            alt: `Photo ${type} ${i + 1}`,
            caption: p.description || p.room || `Photo ${type} ${i + 1}`,
        }));
        setLightboxImages(images);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending_agent: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            agent_accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            in_progress: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    const beforePhotos = (mission.photos || []).filter(p => p.type === 'before');
    const afterPhotos = (mission.photos || []).filter(p => p.type === 'after');

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
                        <Link href={route('client.missions.index')} className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour aux missions
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {mission.mission_number}
                                    </h1>
                                    <Badge className={getStatusColor(mission.status)}>
                                        {mission.status_label}
                                    </Badge>
                                </div>
                            </div>
                            {/* Invoice Download Button */}
                            {canDownloadInvoice && mission.invoice && (
                                <a href={route('client.invoices.download', mission.invoice.id)}>
                                    <Button className="bg-sky-600 hover:bg-sky-700">
                                        <Download className="h-4 w-4 mr-2" />
                                        Télécharger la facture
                                    </Button>
                                </a>
                            )}
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
                                <Card className="dark:bg-slate-800 dark:border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Camera className="h-5 w-5 text-sky-500" />
                                            Photos avant intervention
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {beforePhotos.map((photo, idx) => (
                                                <div key={photo.id} className="relative group cursor-pointer" onClick={() => openLightbox(beforePhotos, idx, 'avant')}>
                                                    <img
                                                        src={`/storage/${photo.path}`}
                                                        alt={photo.description || 'Photo avant'}
                                                        className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
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
                                <Card className="dark:bg-slate-800 dark:border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Camera className="h-5 w-5 text-green-500" />
                                            Photos après intervention
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {afterPhotos.map((photo, idx) => (
                                                <div key={photo.id} className="relative group cursor-pointer" onClick={() => openLightbox(afterPhotos, idx, 'après')}>
                                                    <img
                                                        src={`/storage/${photo.path}`}
                                                        alt={photo.description || 'Photo après'}
                                                        className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
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
                                <Card className="dark:bg-slate-800 dark:border-slate-700">
                                    <CardContent className="p-6 text-center">
                                        <Camera className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                        <p className="text-slate-500 dark:text-slate-400">
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
                                <Card className="dark:bg-slate-800 dark:border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base dark:text-white">
                                            <User className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                            Agent
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center">
                                                <User className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium dark:text-white">{mission.agent.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Agent VIMAIZ</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Property */}
                            <Card className="dark:bg-slate-800 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base dark:text-white">
                                        <Home className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                        Logement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium dark:text-white">{mission.property.name || mission.property.type_label}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        {mission.property.address_line1}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {mission.property.postal_code} {mission.property.city}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Schedule */}
                            <Card className="dark:bg-slate-800 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base dark:text-white">
                                        <Calendar className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                        Planification
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Date</span>
                                        <span className="font-medium dark:text-white">
                                            {new Date(mission.scheduled_at).toLocaleDateString('fr-FR', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Heure</span>
                                        <span className="font-medium dark:text-white">
                                            {new Date(mission.scheduled_at).toLocaleTimeString('fr-FR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Durée</span>
                                        <span className="font-medium dark:text-white">{mission.duration_hours}h</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Price */}
                            <Card className="dark:bg-slate-800 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-base dark:text-white">Montant</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{mission.total_price} €</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Payé</p>
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                </div>
            </div>

            <ImageLightbox
                images={lightboxImages}
                initialIndex={lightboxIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </AppLayout>
    );
}
