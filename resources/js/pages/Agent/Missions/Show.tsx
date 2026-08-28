import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Home, MapPin, User, CheckCircle, XCircle, Play, Star, Award, AlertCircle, Maximize, BedDouble, Bath, Layers, DoorOpen, Wifi, Trash2, Clock } from 'lucide-react';
import PropertyMap from '@/components/map/PropertyMap';
import { useEffect, useState } from 'react';
import InterventionReportWizard, {
    type DraftAnomaly,
    type ReportCategory,
} from '@/components/missions/InterventionReportWizard';
import InterventionReportCard, { type ReportAnomaly, type ReportSummary } from '@/components/missions/InterventionReportCard';
import { AgentProposalActions } from '@/components/missions/AgentProposalActions';
import { elapsedMinutesBetween, formatDurationMinutes } from '@/lib/duration';
import { formatAppointmentDate, formatAppointmentTime } from '@/lib/datetime';

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
    scheduled_time_label?: string | null;
    started_at: string | null;
    completed_at: string | null;
    duration_hours: number;
    actual_duration_minutes: number | null;
    actual_duration_label: string | null;
    estimated_duration_label: string | null;
    agent_payout: number;
    status: string;
    status_label: string;
    checklist: Array<{
        id: string;
        title: string;
        emoji?: string;
        items: Array<{
            id: string;
            label: string;
            checked?: boolean;
            checked_at?: string | null;
        }>;
    }> | null;
    property: Property;
    client: Client;
    internal_quality_score: number | null;
    internal_quality_notes: string | null;
    client_review?: {
        rating: number;
        comment: string | null;
        created_at: string;
    } | null;
    anomalies?: ReportAnomaly[];
    report_nothing_to_report?: boolean | null;
}

interface Props {
    mission: Mission;
    canAccept: boolean;
    canRefuse: boolean;
    canStart: boolean;
    canComplete: boolean;
    checklistProgress: {
        total: number;
        checked: number;
        complete: boolean;
    };
    reportCatalog?: ReportCategory[];
    reportSummary?: ReportSummary;
}

const charTileClass = 'flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600';
const charLabelClass = 'text-xs text-slate-500 dark:text-slate-400';
const charValueClass = 'text-sm font-medium text-slate-900 dark:text-white';

export default function Show({
    mission,
    canAccept,
    canRefuse = false,
    canStart,
    canComplete,
    checklistProgress = { total: 0, checked: 0, complete: true },
    reportCatalog = [],
    reportSummary,
}: Props) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash;
    const [starting, setStarting] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [togglingItem, setTogglingItem] = useState<string | null>(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [elapsedMinutes, setElapsedMinutes] = useState(() =>
        elapsedMinutesBetween(mission.started_at, mission.completed_at),
    );

    useEffect(() => {
        setElapsedMinutes(elapsedMinutesBetween(mission.started_at, mission.completed_at));
        if (!mission.started_at || mission.completed_at) {
            return;
        }
        const timer = window.setInterval(() => {
            setElapsedMinutes(elapsedMinutesBetween(mission.started_at, null));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [mission.started_at, mission.completed_at]);

    const durationLabel = mission.completed_at
        ? (mission.actual_duration_label || (elapsedMinutes != null ? formatDurationMinutes(elapsedMinutes) : null))
        : (elapsedMinutes != null ? formatDurationMinutes(elapsedMinutes) : null);

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

    const handleRefuse = () => {
        if (confirm('Décliner cette intervention ? Elle sera proposée à d\'autres intervenants.')) {
            postRefuse(route('agent.missions.refuse', mission.id));
        }
    };

    const handleStart = () => {
        if (!mission.property.latitude || !mission.property.longitude) {
            setLocationError(
                'Nous ne pouvons pas confirmer automatiquement l\'emplacement de ce bien. '
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
                    1: 'Pour confirmer que vous êtes au bon bien, autorisez l\'accès à votre position dans les paramètres de votre navigateur ou téléphone.',
                    2: 'Nous n\'avons pas pu localiser votre position. Placez-vous devant le bien, puis réessayez.',
                    3: 'La vérification de votre position a pris trop de temps. Restez devant le bien et réessayez.',
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
        setReportOpen(true);
    };

    const handleSubmitReport = (payload: { nothing_to_report: boolean; anomalies: DraftAnomaly[] }) => {
        setCompleting(true);
        router.post(
            route('agent.missions.complete', mission.id),
            {
                nothing_to_report: payload.nothing_to_report ? 1 : 0,
                anomalies: payload.anomalies,
            },
            {
                preserveScroll: true,
                onFinish: () => setCompleting(false),
                onSuccess: () => setReportOpen(false),
            },
        );
    };

    const handleToggleChecklistItem = (sectionId: string, itemId: string, checked: boolean) => {
        const key = `${sectionId}:${itemId}`;
        setTogglingItem(key);
        router.patch(
            route('agent.missions.checklist', mission.id),
            {
                section_id: sectionId,
                item_id: itemId,
                checked,
            },
            {
                preserveScroll: true,
                onFinish: () => setTogglingItem(null),
            },
        );
    };

    const hasPropertyCoordinates = Boolean(mission.property.latitude && mission.property.longitude);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Mes interventions', href: route('agent.missions.index') },
            { title: mission.mission_number, href: '#' },
        ]}>
            <Head title={`Intervention ${mission.mission_number}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link href={route('agent.missions.index')} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour aux interventions
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
                                <h3 className="font-semibold text-orange-800 mb-4">Répondez à cette intervention</h3>
                                <AgentProposalActions missionId={mission.id} />
                            </CardContent>
                        </Card>
                    )}

                    {canStart && (
                        <Card className="mb-6 border-sky-300 bg-sky-50">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-sky-800 mb-2 text-center">
                                    Démarrer l&apos;intervention
                                </h3>
                                <p className="text-sm text-sky-700 mb-4 text-center">
                                    Placez-vous devant le bien, puis démarrez pour confirmer que vous êtes sur place.
                                </p>
                                {!hasPropertyCoordinates && (
                                    <p className="text-sm text-amber-700 mb-4 text-center">
                                        La position GPS de ce bien n&apos;est pas enregistrée : vérifiez l&apos;adresse
                                        manuellement, puis contactez le support si vous avez un doute.
                                    </p>
                                )}
                                <div className="text-center">
                                    <Button
                                        onClick={handleStart}
                                        disabled={starting}
                                        className="bg-sky-500 hover:bg-sky-600"
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        {starting
                                            ? 'Vérification que vous êtes sur place...'
                                            : 'Démarrer l\'intervention'}
                                    </Button>
                                    {canRefuse && (
                                        <div className="mt-4">
                                            <Button variant="outline" onClick={handleRefuse} disabled={refuseProcessing} className="text-red-600">
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Décliner l'intervention
                                            </Button>
                                        </div>
                                    )}
                                    <p className="text-xs text-sky-600 mt-3">
                                        En cliquant, vous confirmez être devant le bien de cette intervention.
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
                                        <h3 className="font-semibold text-green-800 mb-2">Intervention en cours</h3>
                                        <p className="text-sm text-green-700 mb-4">
                                            Cochez les tâches réalisées, puis terminez avec le rapport d&apos;intervention.
                                        </p>
                                        <p className="text-sm text-green-800 mb-1 font-medium">
                                            Checklist : {checklistProgress.checked}/{checklistProgress.total}
                                        </p>
                                        {durationLabel && (
                                            <p className="text-sm text-green-700 mb-4 flex items-center justify-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                Temps passé : {durationLabel}
                                            </p>
                                        )}
                                        {!durationLabel && <div className="mb-4" />}
                                        <Button
                                            onClick={handleComplete}
                                            className="bg-green-500 hover:bg-green-600"
                                        >
                                            Terminer l'intervention
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {mission.checklist && mission.checklist.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Checklist du bien</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        {mission.checklist.map((section) => (
                                            <div key={section.id}>
                                                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                                                    {section.emoji ? `${section.emoji} ` : ''}
                                                    {section.title}
                                                </h4>
                                                <ul className="space-y-2">
                                                    {section.items.map((item) => {
                                                        const key = `${section.id}:${item.id}`;
                                                        const disabled =
                                                            !canComplete || togglingItem === key;
                                                        return (
                                                            <li key={item.id}>
                                                                <label
                                                                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                                                                        item.checked
                                                                            ? 'border-green-200 bg-green-50'
                                                                            : 'border-slate-200 bg-white'
                                                                    } ${disabled && !canComplete ? 'opacity-70' : 'cursor-pointer'}`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        className="mt-1 h-4 w-4"
                                                                        checked={Boolean(item.checked)}
                                                                        disabled={disabled}
                                                                        onChange={(e) =>
                                                                            handleToggleChecklistItem(
                                                                                section.id,
                                                                                item.id,
                                                                                e.target.checked,
                                                                            )
                                                                        }
                                                                    />
                                                                    <span
                                                                        className={`text-sm ${
                                                                            item.checked
                                                                                ? 'text-green-800 line-through'
                                                                                : 'text-slate-700'
                                                                        }`}
                                                                    >
                                                                        {item.label}
                                                                    </span>
                                                                </label>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        ))}
                                        {!canComplete && mission.status !== 'completed' && (
                                            <p className="text-xs text-slate-500">
                                                La checklist devient cochable une fois l'intervention démarrée.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {mission.status === 'completed' && reportSummary && (
                                <InterventionReportCard
                                    propertyName={mission.property.name || mission.property.type_label}
                                    completedAt={mission.completed_at}
                                    summary={reportSummary}
                                    anomalies={mission.anomalies ?? []}
                                />
                            )}

                            {mission.status === 'completed' && (
                                <Card className="border-green-300 bg-green-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Award className="h-8 w-8 text-green-500" />
                                            <div>
                                                <h3 className="font-semibold text-green-800">Intervention terminée</h3>
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
                                        Bien
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
                                            <div className={charTileClass}>
                                                <Maximize className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                                <div>
                                                    <p className={charLabelClass}>Surface</p>
                                                    <p className={charValueClass}>{mission.property.surface_area} m²</p>
                                                </div>
                                            </div>
                                            <div className={charTileClass}>
                                                <BedDouble className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                                <div>
                                                    <p className={charLabelClass}>Chambres</p>
                                                    <p className={charValueClass}>{mission.property.bedrooms}</p>
                                                </div>
                                            </div>
                                            <div className={charTileClass}>
                                                <Bath className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                                <div>
                                                    <p className={charLabelClass}>Salles de bain</p>
                                                    <p className={charValueClass}>{mission.property.bathrooms}</p>
                                                </div>
                                            </div>
                                            <div className={charTileClass}>
                                                <Bath className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                                <div>
                                                    <p className={charLabelClass}>Toilettes</p>
                                                    <p className={charValueClass}>{mission.property.toilets}</p>
                                                </div>
                                            </div>
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
                                            {formatAppointmentDate(mission.scheduled_at, {
                                                weekday: 'long', day: 'numeric', month: 'long',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Heure</span>
                                        <span className="font-medium">
                                            {mission.scheduled_time_label || formatAppointmentTime(mission.scheduled_at)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Durée estimée</span>
                                        <span className="font-medium">
                                            {mission.estimated_duration_label || `${mission.duration_hours}h`}
                                        </span>
                                    </div>
                                    {durationLabel && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Temps passé</span>
                                            <span className="font-medium">{durationLabel}</span>
                                        </div>
                                    )}
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

            <InterventionReportWizard
                open={reportOpen}
                onOpenChange={setReportOpen}
                catalog={reportCatalog}
                checklistProgress={checklistProgress}
                durationLabel={durationLabel || ''}
                processing={completing}
                onSubmit={handleSubmitReport}
            />
        </AppLayout>
    );
}
