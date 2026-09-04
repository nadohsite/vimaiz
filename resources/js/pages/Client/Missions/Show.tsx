import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Home, MapPin, User, Camera, Clock, CheckCircle, Download, FileText, Star, Send, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { useState } from 'react';
import InterventionReportCard, { type ReportAnomaly, type ReportSummary } from '@/components/missions/InterventionReportCard';
import { formatAppointmentDate, formatAppointmentTime } from '@/lib/datetime';

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

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
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
    total_price: number;
    status: string;
    status_label: string;
    property: Property;
    agent: Agent | null;
    photos?: Photo[];
    invoice?: Invoice | null;
    review?: Review | null;
    // Retour mécontentement
    return_requested: boolean;
    return_status: string | null;
    return_status_label: string | null;
    return_reason: string | null;
    return_requested_at: string | null;
    return_completed_at: string | null;
    return_agent_notes: string | null;
    anomalies?: ReportAnomaly[];
}

interface Props {
    mission: Mission;
    canDownloadInvoice: boolean;
    canReview?: boolean;
    canRequestReturn?: boolean;
    reportSummary?: ReportSummary;
}

export default function Show({ mission, canDownloadInvoice, canReview = false, canRequestReturn = false, reportSummary }: Props) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxImages, setLightboxImages] = useState<{ src: string; alt?: string; caption?: string }[]>([]);
    const [hoverRating, setHoverRating] = useState(0);
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [showValidateForm, setShowValidateForm] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        rating: 0,
        comment: '',
    });

    const returnForm = useForm({
        reason: '',
    });

    const validateForm = useForm({
        feedback: '',
        approved: true,
    });

    const handleRequestReturn = (e: React.FormEvent) => {
        e.preventDefault();
        returnForm.post(route('client.missions.return-request', mission.id), {
            onSuccess: () => {
                returnForm.reset();
                setShowReturnForm(false);
            },
        });
    };

    const handleValidateReturn = (approved: boolean) => {
        validateForm.setData('approved', approved);
        validateForm.post(route('client.missions.return-validate', mission.id), {
            onSuccess: () => {
                validateForm.reset();
                setShowValidateForm(false);
            },
        });
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.rating === 0) return;
        post(route('client.missions.review', mission.id), {
            onSuccess: () => reset(),
        });
    };

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
            { title: 'Mes interventions', href: route('client.missions.index') },
            { title: mission.mission_number, href: '#' },
        ]}>
            <Head title={`Intervention ${mission.mission_number}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={route('client.missions.index')} className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour aux interventions
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
                                <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-8 w-8 text-green-500" />
                                            <div>
                                                <h3 className="font-semibold text-green-800 dark:text-green-300">
                                                    {mission.review ? 'Bien prêt' : 'Intervention terminée'}
                                                </h3>
                                                <p className="text-sm text-green-700 dark:text-green-400">
                                                    Terminée le {mission.completed_at && new Date(mission.completed_at).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                                {mission.actual_duration_label && (
                                                    <p className="text-sm text-green-700 dark:text-green-400 mt-1 flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Durée de l&apos;intervention : {mission.actual_duration_label}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {mission.status === 'completed' && reportSummary && (
                                <InterventionReportCard
                                    propertyName={mission.property.name || mission.property.type_label}
                                    completedAt={mission.completed_at}
                                    summary={reportSummary}
                                    anomalies={mission.anomalies ?? []}
                                    propertyId={mission.property.id}
                                    showFollowUp
                                />
                            )}

                            {/* Review Form */}
                            {canReview && (
                                <Card className="border-sky-200 dark:border-sky-800 dark:bg-slate-800">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 dark:text-white">
                                            <Star className="h-5 w-5 text-yellow-500" />
                                            Donnez votre avis
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmitReview} className="space-y-4">
                                            <div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Comment évaluez-vous cette prestation ?</p>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setData('rating', star)}
                                                            onMouseEnter={() => setHoverRating(star)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                            className="p-1 transition-transform hover:scale-110"
                                                        >
                                                            <Star
                                                                className={`h-8 w-8 ${
                                                                    star <= (hoverRating || data.rating)
                                                                        ? 'text-yellow-400 fill-yellow-400'
                                                                        : 'text-gray-300 dark:text-gray-600'
                                                                }`}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <Textarea
                                                    placeholder="Partagez votre expérience (optionnel)..."
                                                    value={data.comment}
                                                    onChange={(e) => setData('comment', e.target.value)}
                                                    rows={3}
                                                    className="dark:bg-slate-700 dark:border-slate-600"
                                                />
                                            </div>
                                            <Button 
                                                type="submit" 
                                                disabled={processing || data.rating === 0}
                                                className="bg-sky-600 hover:bg-sky-700"
                                            >
                                                <Send className="h-4 w-4 mr-2" />
                                                Envoyer mon avis
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Existing Review */}
                            {mission.review && (
                                <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base dark:text-white">
                                            <Star className="h-5 w-5 text-yellow-500" />
                                            Votre avis
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-5 w-5 ${
                                                        star <= mission.review!.rating
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300 dark:text-gray-600'
                                                    }`}
                                                />
                                            ))}
                                            <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {mission.review.rating}/5
                                            </span>
                                        </div>
                                        {mission.review.comment && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                                                "{mission.review.comment}"
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                            Publié le {new Date(mission.review.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Retour mécontentement - Demande */}
                            {canRequestReturn && !mission.return_requested && (
                                <Card className="border-amber-200 dark:border-amber-800 dark:bg-slate-800">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 dark:text-white">
                                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                                            Pas satisfait ?
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {!showReturnForm ? (
                                            <div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                                    Si vous n'êtes pas satisfait de la prestation, vous pouvez demander un retour gratuit de l'intervenant dans les 48 heures suivant l'intervention.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowReturnForm(true)}
                                                    className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
                                                >
                                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                                    Demander un retour
                                                </Button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleRequestReturn} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        Décrivez le problème rencontré *
                                                    </label>
                                                    <Textarea
                                                        placeholder="Expliquez pourquoi vous n'êtes pas satisfait..."
                                                        value={returnForm.data.reason}
                                                        onChange={(e) => returnForm.setData('reason', e.target.value)}
                                                        rows={4}
                                                        required
                                                        minLength={10}
                                                        className="dark:bg-slate-700 dark:border-slate-600"
                                                    />
                                                    {returnForm.errors.reason && (
                                                        <p className="text-sm text-red-500 mt-1">{returnForm.errors.reason}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="submit"
                                                        disabled={returnForm.processing}
                                                        className="bg-amber-500 hover:bg-amber-600"
                                                    >
                                                        {returnForm.processing ? 'Envoi...' : 'Envoyer la demande'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => setShowReturnForm(false)}
                                                    >
                                                        Annuler
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Retour mécontentement - Statut */}
                            {mission.return_requested && (
                                <Card className={`border-2 ${
                                    mission.return_status === 'validated' ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20' :
                                    mission.return_status === 'rejected' ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' :
                                    'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
                                }`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 dark:text-white">
                                            <AlertTriangle className={`h-5 w-5 ${
                                                mission.return_status === 'validated' ? 'text-green-500' :
                                                mission.return_status === 'rejected' ? 'text-red-500' :
                                                'text-amber-500'
                                            }`} />
                                            Demande de retour
                                            <Badge className={
                                                mission.return_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                mission.return_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                mission.return_status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                                mission.return_status === 'validated' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }>
                                                {mission.return_status_label}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Votre motif :</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{mission.return_reason}</p>
                                        </div>

                                        {mission.return_status === 'pending' && (
                                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                                ⏳ L'intervenant a été notifié et va prendre en charge votre demande.
                                            </p>
                                        )}

                                        {mission.return_status === 'in_progress' && (
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                🔄 L'intervenant est en train d'effectuer le retour.
                                            </p>
                                        )}

                                        {mission.return_status === 'completed' && (
                                            <div className="space-y-4">
                                                {mission.return_agent_notes && (
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes de l'intervenant :</p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{mission.return_agent_notes}</p>
                                                    </div>
                                                )}
                                                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                                                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-3">
                                                        L'intervenant a terminé le retour. Êtes-vous satisfait ?
                                                    </p>
                                                    <Textarea
                                                        placeholder="Commentaire (optionnel)..."
                                                        value={validateForm.data.feedback}
                                                        onChange={(e) => validateForm.setData('feedback', e.target.value)}
                                                        rows={2}
                                                        className="mb-3 dark:bg-slate-700 dark:border-slate-600"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleValidateReturn(true)}
                                                            disabled={validateForm.processing}
                                                            className="bg-green-500 hover:bg-green-600"
                                                        >
                                                            <ThumbsUp className="h-4 w-4 mr-2" />
                                                            Oui, je suis satisfait
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleValidateReturn(false)}
                                                            disabled={validateForm.processing}
                                                            variant="outline"
                                                            className="border-red-300 text-red-700 hover:bg-red-50"
                                                        >
                                                            <ThumbsDown className="h-4 w-4 mr-2" />
                                                            Non
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {mission.return_status === 'validated' && (
                                            <p className="text-sm text-green-700 dark:text-green-300">
                                                ✅ Merci ! Le retour a été validé avec succès.
                                            </p>
                                        )}

                                        {mission.return_status === 'rejected' && (
                                            <p className="text-sm text-red-700 dark:text-red-300">
                                                ❌ Vous avez indiqué ne pas être satisfait. Notre équipe va examiner votre dossier et vous contacter.
                                            </p>
                                        )}
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

                            {/* Suivi géolocalisé */}
                            {(mission.photos || []).length === 0 && (
                                <Card className="dark:bg-slate-800 dark:border-slate-700">
                                    <CardContent className="p-6 text-center">
                                        <MapPin className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                        <p className="text-slate-500 dark:text-slate-400">
                                            L&apos;arrivée de l&apos;intervenant est vérifiée par géolocalisation à proximité
                                            du bien, et le début comme la fin de l&apos;intervention sont horodatés.
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
                                            Intervenant
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center">
                                                <User className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium dark:text-white">{mission.agent.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Intervenant VIMAIZ</p>
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
                                        Bien
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
                                        Horaires
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Date</span>
                                        <span className="font-medium dark:text-white">
                                            {formatAppointmentDate(mission.scheduled_at, {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Heure souhaitée</span>
                                        <span className="font-medium dark:text-white">
                                            {mission.scheduled_time_label || formatAppointmentTime(mission.scheduled_at)}
                                        </span>
                                    </div>
                                    {mission.started_at && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">Heure de début</span>
                                            <span className="font-medium dark:text-white">
                                                {new Date(mission.started_at).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    {mission.completed_at && mission.actual_duration_label && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">Durée de l&apos;intervention</span>
                                            <span className="font-medium dark:text-white">
                                                {mission.actual_duration_label}
                                            </span>
                                        </div>
                                    )}
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
