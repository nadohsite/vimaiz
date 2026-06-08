import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Home, MapPin, User, Clock, CheckCircle, XCircle, Play, Star, Award, ChevronRight, AlertCircle } from 'lucide-react';
import PropertyMap from '@/components/map/PropertyMap';
import { PropertyPreviewModal, type PropertyPreview } from '@/components/property/PropertyPreviewModal';
import { useState } from 'react';

interface Property extends PropertyPreview {
    latitude: number | null;
    longitude: number | null;
}

interface Client {
    id: number;
    name: string;
    phone: string | null;
}

interface Mission {
    id: number;
    mission_number: string;
    scheduled_at: string;
    started_at: string | null;
    completed_at: string | null;
    duration_hours: number;
    agent_payout: number;
    status: string;
    status_label: string;
    agent_id: number | null;
    property: Property;
    client: Client;
    internal_quality_score: number | null;
    internal_quality_notes: string | null;
    client_review?: {
        rating: number;
        comment: string | null;
        created_at: string;
    } | null;
}

interface Props {
    mission: Mission;
    canAccept: boolean;
    canRefuse: boolean;
    canStart: boolean;
    canComplete: boolean;
}

function propertyHasGps(property: Property): boolean {
    return (
        property.latitude !== null &&
        property.longitude !== null &&
        property.latitude !== 0 &&
        property.longitude !== 0
    );
}

const geolocationErrorMessages: Record<number, string> = {
    1: 'Autorisez l\'accès à votre position pour démarrer la mission.',
    2: 'Impossible de déterminer votre position. Réessayez.',
    3: 'La localisation a expiré. Réessayez.',
};

export default function Show({ mission, canAccept, canRefuse, canStart, canComplete }: Props) {
    const [starting, setStarting] = useState(false);
    const [startError, setStartError] = useState<string | null>(null);
    const [propertyModalOpen, setPropertyModalOpen] = useState(false);
    const { flash } = usePage<{ flash?: { success?: string; error?: string; info?: string } }>().props;

    const { post: postRefuse, processing: refuseProcessing } = useForm({
        reason: '',
    });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending_agent: 'bg-orange-100 text-orange-800',
            agent_accepted: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-sky-100 text-sky-800',
            photos_before: 'bg-sky-100 text-sky-800',
            photos_after: 'bg-sky-100 text-sky-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const handleAccept = () => {
        router.post(route('agent.missions.accept', mission.id));
    };

    const handleRefuse = () => {
        const isDecline = mission.status === 'agent_accepted';
        const message = isDecline
            ? 'Décliner cette mission ? Elle sera reproposée aux autres agents disponibles.'
            : 'Êtes-vous sûr de vouloir refuser cette mission ?';

        if (confirm(message)) {
            postRefuse(route('agent.missions.refuse', mission.id));
        }
    };

    const handleStart = () => {
        if (!navigator.geolocation) {
            setStartError('La géolocalisation n\'est pas disponible sur cet appareil.');
            return;
        }

        setStarting(true);
        setStartError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                router.post(
                    route('agent.missions.start', mission.id),
                    {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    },
                    {
                        onFinish: () => setStarting(false),
                        onError: () => setStarting(false),
                    },
                );
            },
            (error) => {
                setStarting(false);
                setStartError(
                    geolocationErrorMessages[error.code] ?? 'Impossible d\'obtenir votre position. Réessayez.',
                );
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        );
    };

    const handleComplete = () => {
        if (confirm('Confirmer la fin de la mission ?')) {
            router.post(route('agent.missions.complete', mission.id));
        }
    };

    const hasGps = propertyHasGps(mission.property);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Mes missions', href: route('agent.missions.index') },
            { title: mission.mission_number, href: '#' },
        ]}>
            <Head title={`Mission ${mission.mission_number}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {(flash?.success || flash?.error || flash?.info) && (
                        <div className="mb-6 space-y-3">
                            {flash.success && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3" role="status">
                                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                                    <p className="text-green-800">{flash.success}</p>
                                </div>
                            )}
                            {flash.error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3" role="alert">
                                    <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                                    <p className="text-red-800">{flash.error}</p>
                                </div>
                            )}
                            {flash.info && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3" role="status">
                                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                                    <p className="text-blue-800">{flash.info}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mb-8">
                        <Link href={route('agent.missions.index')} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour aux missions
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900">{mission.mission_number}</h1>
                                    <Badge className={getStatusColor(mission.status)}>{mission.status_label}</Badge>
                                </div>
                                <p className="text-lg font-bold text-green-600 mt-1">{mission.agent_payout} €</p>
                            </div>
                        </div>
                    </div>

                    {mission.status === 'pending_agent' && (canAccept || canRefuse) && (
                        <Card className="mb-6 border-orange-300 bg-orange-50">
                            <CardContent className="p-6">
                                {mission.agent_id ? (
                                    <>
                                        <h3 className="font-semibold text-orange-800 mb-2">Mission assignée — confirmez votre disponibilité</h3>
                                        <p className="text-sm text-orange-700 mb-4">
                                            Cette mission vous a été attribuée. Confirmez-la pour la verrouiller ou refusez-la si vous n&apos;êtes pas disponible.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="font-semibold text-orange-800 mb-2">Mission proposée — premier accepteur gagne</h3>
                                        <p className="text-sm text-orange-700 mb-4">
                                            D&apos;autres agents voient aussi cette mission. Elle disparaîtra chez eux dès qu&apos;un agent l&apos;accepte.
                                        </p>
                                    </>
                                )}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {canAccept && (
                                        <Button onClick={handleAccept} className="bg-green-500 hover:bg-green-600 flex-1">
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Accepter
                                        </Button>
                                    )}
                                    {canRefuse && (
                                        <Button variant="outline" onClick={handleRefuse} disabled={refuseProcessing} className="flex-1 text-red-600">
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Refuser
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {canStart && (
                        <Card className="mb-6 border-sky-300 bg-sky-50">
                            <CardContent className="p-6 text-center">
                                <h3 className="font-semibold text-sky-800 mb-4">Êtes-vous bien devant le logement ?</h3>
                                {!hasGps && (
                                    <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">
                                        Localisation du logement indisponible. Contactez le support.
                                    </p>
                                )}
                                {startError && (
                                    <p className="mb-4 text-sm text-red-600" role="alert">
                                        {startError}
                                    </p>
                                )}
                                <Button
                                    onClick={handleStart}
                                    disabled={starting || !hasGps}
                                    className="bg-sky-500 hover:bg-sky-600"
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    {starting ? 'Vérification...' : 'Démarrer la mission'}
                                </Button>
                                {canRefuse && (
                                    <div className="mt-4 pt-4 border-t border-sky-200">
                                        <Button
                                            variant="outline"
                                            onClick={handleRefuse}
                                            disabled={refuseProcessing}
                                            className="text-red-600"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Décliner la mission
                                        </Button>
                                        <p className="text-xs text-sky-700 mt-2">
                                            La mission sera reproposée aux autres agents si vous déclinez avant de démarrer.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            {canComplete && (
                                <Card className="border-green-300 bg-green-50">
                                    <CardContent className="p-6 text-center">
                                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                        <h3 className="font-semibold text-green-800 mb-4">Terminer la mission</h3>
                                        <Button onClick={handleComplete} className="bg-green-500 hover:bg-green-600">
                                            Terminer la mission
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {mission.status === 'completed' && (
                                <Card className="border-green-300 bg-green-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Award className="h-8 w-8 text-green-500" />
                                            <div>
                                                <h3 className="font-semibold text-green-800">Mission terminée</h3>
                                                <p className="text-sm text-green-600">
                                                    {mission.completed_at && new Date(mission.completed_at).toLocaleDateString('fr-FR', {
                                                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {mission.internal_quality_score && (
                                            <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                                                <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                                                    <Star className="h-4 w-4 text-yellow-500" />
                                                    Évaluation qualité (Admin)
                                                </h4>
                                                <div className="flex items-center gap-1 mb-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-5 w-5 ${
                                                                star <= mission.internal_quality_score!
                                                                    ? 'text-yellow-400 fill-yellow-400'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                    <span className="ml-2 text-sm font-medium text-slate-600">
                                                        {mission.internal_quality_score}/5
                                                    </span>
                                                </div>
                                                {mission.internal_quality_notes && (
                                                    <p className="text-sm text-slate-600 mt-2">
                                                        {mission.internal_quality_notes}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {mission.client_review && (
                                            <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                                                <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                                                    <User className="h-4 w-4 text-sky-500" />
                                                    Avis du client
                                                </h4>
                                                <div className="flex items-center gap-1 mb-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-5 w-5 ${
                                                                star <= mission.client_review!.rating
                                                                    ? 'text-yellow-400 fill-yellow-400'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                    <span className="ml-2 text-sm font-medium text-slate-600">
                                                        {mission.client_review.rating}/5
                                                    </span>
                                                </div>
                                                {mission.client_review.comment && (
                                                    <p className="text-sm text-slate-600 italic">
                                                        &ldquo;{mission.client_review.comment}&rdquo;
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            <PropertyMap
                                latitude={mission.property.latitude}
                                longitude={mission.property.longitude}
                                address={`${mission.property.address_line1}, ${mission.property.postal_code} ${mission.property.city}`}
                                propertyName={mission.property.name || mission.property.type_label}
                            />
                        </div>

                        <div className="space-y-6">
                            <Card
                                className="cursor-pointer transition-colors hover:border-sky-300 focus-within:ring-2 focus-within:ring-sky-500"
                                role="button"
                                tabIndex={0}
                                onClick={() => setPropertyModalOpen(true)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setPropertyModalOpen(true);
                                    }
                                }}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Home className="h-4 w-4 text-sky-500" />
                                        Logement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium">{mission.property.name || mission.property.type_label}</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {mission.property.city}
                                    </p>
                                    <p className="text-sm text-slate-500">{mission.property.surface_area} m²</p>
                                    <p className="mt-3 flex items-center gap-1 text-sm text-sky-600">
                                        Voir les détails du logement
                                        <ChevronRight className="h-4 w-4" />
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Calendar className="h-4 w-4 text-sky-500" />
                                        Horaires
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Date</span>
                                        <span className="font-medium">
                                            {new Date(mission.scheduled_at).toLocaleDateString('fr-FR', {
                                                weekday: 'long', day: 'numeric', month: 'long',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Heure</span>
                                        <span className="font-medium">
                                            {new Date(mission.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Durée</span>
                                        <span className="font-medium">{mission.duration_hours}h</span>
                                    </div>
                                    {mission.started_at && (
                                        <div className="flex justify-between pt-2 border-t">
                                            <span className="text-slate-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Démarrée
                                            </span>
                                            <span className="font-medium">
                                                {new Date(mission.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="h-4 w-4 text-sky-500" />
                                        Client
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium">{mission.client.name}</p>
                                    {mission.client.phone && (
                                        <a href={`tel:${mission.client.phone}`} className="text-sm text-sky-600 hover:underline">
                                            {mission.client.phone}
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <PropertyPreviewModal
                property={mission.property}
                open={propertyModalOpen}
                onOpenChange={setPropertyModalOpen}
            />
        </AppLayout>
    );
}
