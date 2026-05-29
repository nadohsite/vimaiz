
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Home, MapPin, User, Camera, Clock, CheckCircle, XCircle, Play, Upload, Trash2, Star, Award } from 'lucide-react';
import PropertyMap from '@/components/map/PropertyMap';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import { cn, getStorageUrl } from '@/lib/utils';
import { prepareImageForUpload } from '@/lib/prepare-image-upload';
import { useState, useRef } from 'react';

const PREPARE_TIMEOUT_MS = 12000;

function validatePhotoFile(file: File): string | null {
    if (file.type.startsWith('image/')) {
        return null;
    }

    if (/\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(file.name)) {
        return null;
    }

    return 'Le fichier doit être une image.';
}

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
    return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
            window.setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
        }),
    ]);
};

function firstValidationError(errors: Record<string, string | string[]>): string {
    const first = Object.values(errors)[0];
    if (!first) {
        return 'Erreur lors de l’envoi de la photo.';
    }
    return Array.isArray(first) ? first[0] : first;
}

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
    access_code: string | null;
    entry_instructions: string | null;
    surface_area: number;
}

interface Client {
    id: number;
    name: string;
    phone: string | null;
}

interface Photo {
    id: number;
    type: 'before' | 'after';
    path: string;
    description: string | null;
    room: string | null;
    validated_at: string | null;
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
    photos: Photo[];
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
    requiredPhotos: number;
}

export default function Show({ mission, canAccept, canStart, canComplete, requiredPhotos }: Props) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [photoType, setPhotoType] = useState<'before' | 'after'>('before');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const isMobile = useIsMobile();
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxImages, setLightboxImages] = useState<{ src: string; alt?: string; caption?: string }[]>([]);

    const openLightbox = (photos: Photo[], index: number, type: string) => {
        const images = photos.map((p, i) => ({
            src: getStorageUrl(p.path),
            alt: `Photo ${type} ${i + 1}`,
            caption: p.description || `Photo ${type} ${i + 1}`,
        }));
        setLightboxImages(images);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const { data: refuseData, setData: setRefuseData, post: postRefuse, processing: refuseProcessing } = useForm({
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
        router.post(route('agent.missions.start', mission.id));
    };

    const handleComplete = () => {
        if (confirm('Confirmer la fin de la mission ?')) {
            router.post(route('agent.missions.complete', mission.id));
        }
    };

    const resetFileInputs = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const validationError = validatePhotoFile(file);
        if (validationError) {
            setUploadError(validationError);
            resetFileInputs();
            return;
        }

        const canUploadSelected = photoType === 'before' ? canUploadBefore : canUploadAfter;
        if (!canUploadSelected) {
            setUploadError(
                photoType === 'after' && mission.status === 'agent_accepted'
                    ? 'Démarrez la mission avant d\'envoyer les photos après.'
                    : 'Vous ne pouvez plus envoyer de photos pour cette catégorie.',
            );
            resetFileInputs();
            return;
        }

        setUploadError(null);
        setUploading(true);

        try {
            const prepared = await withTimeout(
                prepareImageForUpload(file),
                PREPARE_TIMEOUT_MS,
                'Préparation de la photo trop longue. Réessayez.',
            );

            const formData = new FormData();
            formData.append('photo', prepared);
            formData.append('type', photoType);

            router.post(route('agent.missions.upload-photo', mission.id), formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'Photo envoyée',
                        description: 'La photo a été ajoutée à la mission.',
                    });
                },
                onFinish: () => {
                    setUploading(false);
                    resetFileInputs();
                },
                onError: (errors) => {
                    setUploadError(firstValidationError(errors));
                },
            });
        } catch (error) {
            setUploading(false);
            resetFileInputs();
            setUploadError(
                error instanceof Error
                    ? error.message
                    : 'Erreur lors de la préparation de la photo.',
            );
        }
    };

    const handleDeletePhoto = (photoId: number) => {
        if (!confirm('Supprimer cette photo ?')) {
            return;
        }

        router.delete(route('agent.missions.delete-photo', [mission.id, photoId]), {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: 'Photo supprimée',
                });
            },
            onError: () => {
                setUploadError('Impossible de supprimer cette photo.');
            },
        });
    };

    const beforePhotos = mission.photos.filter(p => p.type === 'before');
    const afterPhotos = mission.photos.filter(p => p.type === 'after');
    const canUploadBefore = ['agent_accepted', 'in_progress', 'photos_before'].includes(mission.status);
    const canUploadAfter = ['in_progress', 'photos_before', 'photos_after'].includes(mission.status);
    const canUploadSelectedType = photoType === 'before' ? canUploadBefore : canUploadAfter;
    const uploadHint =
        photoType === 'after' && !canUploadAfter && mission.status === 'agent_accepted'
            ? 'Démarrez la mission pour envoyer les photos après.'
            : photoType === 'before' && !canUploadBefore
              ? 'Les photos avant ne peuvent plus être modifiées à ce stade.'
              : photoType === 'after' && !canUploadAfter
                ? 'Les photos après ne peuvent plus être envoyées.'
                : beforePhotos.length >= requiredPhotos &&
                    photoType === 'before' &&
                    canUploadAfter &&
                    afterPhotos.length < requiredPhotos
                  ? `Minimum atteint pour l'avant. Passez à « Après » pour continuer.`
                  : null;

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

                    {/* Action Card for Pending */}
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

                    {/* Start Mission */}
                    {canStart && (
                        <Card className="mb-6 border-sky-300 bg-sky-50">
                            <CardContent className="p-6 text-center">
                                <h3 className="font-semibold text-sky-800 mb-2">Prêt à commencer ?</h3>
                                <p className="text-sm text-sky-700 mb-4">N'oubliez pas de prendre les photos avant de commencer.</p>
                                <Button onClick={handleStart} className="bg-sky-500 hover:bg-sky-600">
                                    <Play className="h-4 w-4 mr-2" />
                                    Démarrer la mission
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Photos Upload Section */}
                            {(canUploadBefore || canUploadAfter) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Camera className="h-5 w-5 text-sky-500" />
                                            Photos obligatoires
                                        </CardTitle>
                                        <CardDescription>
                                            Minimum {requiredPhotos} photos avant et après l'intervention
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-4 mb-4">
                                            <Button
                                                type="button"
                                                variant={photoType === 'before' ? 'default' : 'outline'}
                                                onClick={() => {
                                                    setPhotoType('before');
                                                    setUploadError(null);
                                                }}
                                                className={photoType === 'before' ? 'bg-sky-500' : ''}
                                            >
                                                Avant ({beforePhotos.length}/{requiredPhotos})
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={photoType === 'after' ? 'default' : 'outline'}
                                                onClick={() => {
                                                    setPhotoType('after');
                                                    setUploadError(null);
                                                }}
                                                className={photoType === 'after' ? 'bg-green-500' : ''}
                                            >
                                                Après ({afterPhotos.length}/{requiredPhotos})
                                            </Button>
                                        </div>

                                        {uploadHint && !uploadError && (
                                            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
                                                {uploadHint}
                                            </p>
                                        )}
                                        
                                        {/* Input pour galerie (sans capture) */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                        />
                                        {/* Input pour caméra (avec capture) */}
                                        <input
                                            ref={cameraInputRef}
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                        />
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setUploadError(null);
                                                    cameraInputRef.current?.click();
                                                }}
                                                disabled={uploading || !canUploadSelectedType}
                                                className="w-full min-h-11"
                                            >
                                                <Camera className="h-4 w-4 mr-2" />
                                                {uploading ? 'Envoi...' : 'Prendre photo'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setUploadError(null);
                                                    fileInputRef.current?.click();
                                                }}
                                                disabled={uploading || !canUploadSelectedType}
                                                className="w-full min-h-11"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                {uploading ? 'Envoi...' : 'Galerie'}
                                            </Button>
                                        </div>
                                        {(uploadError || flash?.error) && (
                                            <p className="mt-3 text-sm text-red-600" role="alert">
                                                {uploadError || flash?.error}
                                            </p>
                                        )}
                                        <p className="mt-2 text-xs text-slate-500">
                                            Toutes images acceptées (HEIC converti automatiquement). Compression avant envoi.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Before Photos */}
                            {beforePhotos.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Photos avant ({beforePhotos.length})</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {beforePhotos.map((photo, idx) => (
                                                <div key={photo.id} className="relative group">
                                                    <img
                                                        src={getStorageUrl(photo.path)}
                                                        alt="Avant"
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-slate-100"
                                                        onClick={() => openLightbox(beforePhotos, idx, 'avant')}
                                                    />
                                                    {canUploadBefore && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
                                                            className={cn(
                                                                'absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full shadow-sm transition-opacity',
                                                                isMobile ? 'opacity-90' : 'opacity-0 group-hover:opacity-100',
                                                            )}
                                                            aria-label="Supprimer la photo"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* After Photos */}
                            {afterPhotos.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Photos après ({afterPhotos.length})</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {afterPhotos.map((photo, idx) => (
                                                <div key={photo.id} className="relative group">
                                                    <img
                                                        src={getStorageUrl(photo.path)}
                                                        alt="Après"
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-slate-100"
                                                        onClick={() => openLightbox(afterPhotos, idx, 'après')}
                                                    />
                                                    {canUploadAfter && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
                                                            className={cn(
                                                                'absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full shadow-sm transition-opacity',
                                                                isMobile ? 'opacity-90' : 'opacity-0 group-hover:opacity-100',
                                                            )}
                                                            aria-label="Supprimer la photo"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Complete Button */}
                            {canComplete && (
                                <Card className="border-green-300 bg-green-50">
                                    <CardContent className="p-6 text-center">
                                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                        <h3 className="font-semibold text-green-800 mb-2">Prêt à terminer ?</h3>
                                        <p className="text-sm text-green-700 mb-4">Vérifiez que toutes les photos sont envoyées.</p>
                                        <Button onClick={handleComplete} className="bg-green-500 hover:bg-green-600">
                                            Terminer la mission
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Mission Completed Card */}
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
                                        
                                        {/* Admin Quality Review */}
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

                                        {/* Client Review */}
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
                                                        "{mission.client_review.comment}"
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Map - Full Width */}
                            <PropertyMap
                                latitude={mission.property.latitude}
                                longitude={mission.property.longitude}
                                address={`${mission.property.address_line1}, ${mission.property.postal_code} ${mission.property.city}`}
                                propertyName={mission.property.name || mission.property.type_label}
                            />
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
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
                                    <p className="text-sm text-slate-500">{mission.property.postal_code} {mission.property.city}</p>
                                    <p className="text-sm text-slate-500 mt-2">{mission.property.surface_area} m²</p>
                                    
                                    {mission.property.access_code && (
                                        <div className="mt-3 p-2 bg-slate-100 rounded">
                                            <p className="text-xs text-slate-500">Code d'accès</p>
                                            <p className="font-mono font-medium">{mission.property.access_code}</p>
                                        </div>
                                    )}
                                    {mission.property.entry_instructions && (
                                        <p className="text-sm text-slate-600 mt-2">{mission.property.entry_instructions}</p>
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

            <ImageLightbox
                images={lightboxImages}
                initialIndex={lightboxIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </AppLayout>
    );
}
