import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Home, MapPin, User, CheckCircle, XCircle, Play, Star, Award, AlertCircle, Maximize, BedDouble, Bath, Layers, DoorOpen, Wifi, Trash2 } from 'lucide-react';
import PropertyMap from '@/components/map/PropertyMap';
import { useState } from 'react';

interface Property {
    id: number;
    name: string | null;
    type_label: string;
    city: string;
    address_line1: string;
    address_line2: string | null;
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
    canStart: boolean;
    canComplete: boolean;
}

const charTileClass = 'flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600';
const charLabelClass = 'text-xs text-slate-500 dark:text-slate-400';
const charValueClass = 'text-sm font-medium text-slate-900 dark:text-white';

export default function Show({ mission, canAccept, canStart, canComplete }: Props) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash;
    const [starting, setStarting] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const { post: postRefuse, processing: refuseProcessing } = useForm({
        reason: '',
    });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending_agent: 'bg-orange-100 text-orange-800',
            agent_accepted: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-sky-100 text-sky-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const handleAccept = () => {
        router.post(route('agent.missions.accept', mission.id));
    };

    const handleRefuse = () => {
        if (confirm('Êtes-vous sûr de vouloir refuser cette mission ?')) {
            postRefuse(route('agent.missions.refuse', mission.id));
        }
    };

    const handleStart = () => {
        if (!mission.property.latitude || !mission.property.longitude) {
            setLocationError(
                'Nous ne pouvons pas confirmer automatiquement l\'emplacement de ce logement. '
                + 'Vérifiez bien l\'adresse indiquée ci-dessous avant d\'intervenir, puis contactez le support si besoin.',
            );
            return;
        }

        if (!navigator.geolocation) {
            setLocationError(
                'Activez la localisation sur votre appareil pour confirmer que vous êtes au bon endroit avant de démarrer.',
            );
            return;
        }

        setStarting(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                router.post(
                    route('agent.missions.start', mission.id),
                    {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    },
                    {
                        preserveScroll: true,
                        onFinish: () => setStarting(false),
                        onError: () => setStarting(false),
                    },
                );
            },
            (error) => {
                setStarting(false);
                const messages: Record<number, string> = {
                    1: 'Pour confirmer que vous êtes au bon logement, autorisez l\'accès à votre position dans les paramètres de votre navigateur ou téléphone.',
                    2: 'Nous n\'avons pas pu localiser votre position. Placez-vous devant le logement, puis réessayez.',
                    3: 'La vérification de votre position a pris trop de temps. Restez devant le logement et réessayez.',
                };
                setLocationError(
                    messages[error.code]
                        || 'Impossible de vérifier votre position pour le moment. Réessayez une fois sur place.',
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

    const hasPropertyCoordinates = Boolean(mission.property.latitude && mission.property.longitude);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Mes missions', href: route('agent.missions.index') },
            { title: mission.mission_number, href: '#' },
        ]}>
            <Head title={`Mission ${mission.mission_number}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

                    {(flash?.success || flash?.error || locationError) && (
                        <div className="mb-6 space-y-3">
                            {flash?.success && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                                    {flash.success}
                                </div>
                            )}
                            {(flash?.error || locationError) && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{flash?.error || locationError}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {canAccept && (
                        <Card className="mb-6 border-orange-300 bg-orange-50">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-orange-800 mb-4">Répondez à cette mission</h3>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button onClick={handleAccept} className="bg-green-500 hover:bg-green-600 flex-1">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Accepter
                                    </Button>
                                    <Button variant="outline" onClick={handleRefuse} disabled={refuseProcessing} className="flex-1 text-red-600">
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Refuser
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {canStart && (
                        <Card className="mb-6 border-sky-300 bg-sky-50">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-sky-800 mb-2 text-center">
                                    Êtes-vous bien devant le logement ?
                                </h3>
                                {!hasPropertyCoordinates && (
                                    <p className="text-sm text-amber-700 mb-4 text-center">
                                        La position GPS de ce logement n&apos;est pas enregistrée : vérifiez l&apos;adresse
                                        manuellement, puis contactez le support si vous avez un doute.
                                    </p>
                                )}
                                <div className="text-center">
                                    <Button
                                        onClick={handleStart}
                                        disabled={starting || !hasPropertyCoordinates}
                                        className="bg-sky-500 hover:bg-sky-600"
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        {starting
                                            ? 'Vérification que vous êtes sur place...'
                                            : 'Je suis au bon endroit — démarrer'}
                                    </Button>
                                    <p className="text-xs text-sky-600 mt-3">
                                        En cliquant, vous confirmez être devant le logement de cette mission.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            {canComplete && (
                                <Card className="border-green-300 bg-green-50">
                                    <CardContent className="p-6 text-center">
                                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                        <h3 className="font-semibold text-green-800 mb-2">Mission en cours</h3>
                                        <p className="text-sm text-green-700 mb-4">
                                            Une fois l&apos;intervention terminée, cliquez ci-dessous pour clôturer la mission.
                                        </p>
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
                                                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
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
                                                        &quot;{mission.client_review.comment}&quot;
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
                            <Card className="dark:bg-slate-800 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base dark:text-white">
                                        <Home className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                        Logement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium dark:text-white">{mission.property.name || mission.property.type_label}</p>
                                    {mission.property.name && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{mission.property.type_label}</p>
                                    )}
                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        {mission.property.address_line1}
                                    </p>
                                    {mission.property.address_line2 && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{mission.property.address_line2}</p>
                                    )}
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{mission.property.postal_code} {mission.property.city}</p>

                                    <div className="mt-4 pt-4 border-t dark:border-slate-600">
                                        <p className={`${charLabelClass} font-medium uppercase tracking-wider mb-3`}>
                                            Caractéristiques
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {mission.property.surface_area > 0 && (
                                                <div className={charTileClass}>
                                                    <Maximize className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                                    <div>
                                                        <p className={charLabelClass}>Surface</p>
                                                        <p className={charValueClass}>{mission.property.surface_area} m²</p>
                                                    </div>
                                                </div>
                                            )}
                                            {mission.property.bedrooms > 0 && (
                                                <div className={charTileClass}>
                                                    <BedDouble className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                                    <div>
                                                        <p className={charLabelClass}>Chambres</p>
                                                        <p className={charValueClass}>{mission.property.bedrooms}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {mission.property.bathrooms > 0 && (
                                                <div className={charTileClass}>
                                                    <Bath className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                                    <div>
                                                        <p className={charLabelClass}>Salles de bain</p>
                                                        <p className={charValueClass}>{mission.property.bathrooms}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {mission.property.toilets > 0 && (
                                                <div className={charTileClass}>
                                                    <Bath className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                                    <div>
                                                        <p className={charLabelClass}>Toilettes</p>
                                                        <p className={charValueClass}>{mission.property.toilets}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {mission.property.other_rooms > 0 && (
                                                <div className={charTileClass}>
                                                    <DoorOpen className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                                    <div>
                                                        <p className={charLabelClass}>Autres pièces</p>
                                                        <p className={charValueClass}>{mission.property.other_rooms}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {mission.property.floors > 0 && (
                                                <div className={charTileClass}>
                                                    <Layers className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                                    <div>
                                                        <p className={charLabelClass}>Étages</p>
                                                        <p className={charValueClass}>{mission.property.floors}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {mission.property.external_surface != null && mission.property.external_surface > 0 && (
                                                <div className={charTileClass}>
                                                    <Maximize className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                                    <div>
                                                        <p className={charLabelClass}>Surface ext.</p>
                                                        <p className={charValueClass}>{mission.property.external_surface} m²</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {(mission.property.access_code || mission.property.entry_instructions || mission.property.wifi_code || mission.property.trash_instructions || mission.property.additional_info) && (
                                        <div className="mt-4 pt-4 border-t dark:border-slate-600 space-y-3">
                                            {mission.property.access_code && (
                                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                                                    <p className={charLabelClass}>Code d&apos;accès</p>
                                                    <p className="font-mono font-medium text-slate-900 dark:text-white">{mission.property.access_code}</p>
                                                </div>
                                            )}
                                            {mission.property.entry_instructions && (
                                                <div>
                                                    <p className={`${charLabelClass} mb-1`}>Instructions d&apos;accès</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{mission.property.entry_instructions}</p>
                                                </div>
                                            )}
                                            {mission.property.wifi_code && (
                                                <div className="flex items-start gap-2">
                                                    <Wifi className="h-4 w-4 text-sky-500 dark:text-sky-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className={charLabelClass}>Code Wi-Fi</p>
                                                        <p className="text-sm font-medium font-mono text-slate-900 dark:text-white">{mission.property.wifi_code}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {mission.property.trash_instructions && (
                                                <div className="flex items-start gap-2">
                                                    <Trash2 className="h-4 w-4 text-sky-500 dark:text-sky-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className={charLabelClass}>Consignes poubelles</p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{mission.property.trash_instructions}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {mission.property.additional_info && (
                                                <div>
                                                    <p className={`${charLabelClass} mb-1`}>Informations supplémentaires</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{mission.property.additional_info}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                                weekday: 'long', day: 'numeric', month: 'long'
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
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Démarrée</span>
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
        </AppLayout>
    );
}
