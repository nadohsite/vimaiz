import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    Upload, 
    CheckCircle, 
    Clock, 
    XCircle, 
    AlertTriangle,
    Trash2,
    Eye,
    Shield,
    Car,
    Home,
    CreditCard,
    FileCheck
} from 'lucide-react';
import { useState, useRef } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DocumentConfig {
    type: string;
    label: string;
    description: string;
    required: boolean;
    accept: string;
    maxSize: number;
    uploaded: boolean;
    file_path: string | null;
    file_url: string | null;
}

interface AgentProfile {
    id: number;
    siret: string | null;
    company_name: string | null;
    verification_status: string;
}

interface Props {
    agentProfile: AgentProfile;
    documents: Record<string, DocumentConfig>;
    verificationStatus: string;
    rejectionReason: string | null;
}

const breadcrumbs = [
    { title: 'Dashboard', href: route('agent.dashboard') },
    { title: 'Mes documents', href: route('agent.documents.index') },
];

const documentIcons: Record<string, typeof FileText> = {
    id_document: CreditCard,
    address_proof: Home,
    siret_document: FileText,
    driving_license_document: Car,
    insurance_document: Shield,
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    pending: { label: 'En attente', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: Clock },
    submitted: { label: 'En cours de vérification', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    verified: { label: 'Vérifié', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
    rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

export default function DocumentsIndex({ agentProfile, documents, verificationStatus, rejectionReason }: Props) {
    const [uploading, setUploading] = useState<string | null>(null);
    const [deleteType, setDeleteType] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const documentsList = Object.values(documents);
    const uploadedCount = documentsList.filter(d => d.uploaded).length;
    const totalRequired = documentsList.filter(d => d.required).length;
    const allRequiredUploaded = documentsList.filter(d => d.required && !d.uploaded).length === 0;

    const status = statusConfig[verificationStatus] || statusConfig.pending;
    const StatusIcon = status.icon;

    const handleFileSelect = (type: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(type);

        const formData = new FormData();
        formData.append('document', file);

        router.post(route('agent.documents.upload', type), formData, {
            forceFormData: true,
            onFinish: () => {
                setUploading(null);
                if (fileInputRefs.current[type]) {
                    fileInputRefs.current[type]!.value = '';
                }
            },
        });
    };

    const handleDelete = (type: string) => {
        router.delete(route('agent.documents.destroy', type), {
            onFinish: () => setDeleteType(null),
        });
    };

    const handleSubmit = () => {
        setSubmitting(true);
        router.post(route('agent.documents.submit'), {}, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mes documents" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Mes documents
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Téléchargez vos documents pour la vérification de votre profil
                        </p>
                    </div>

                    {/* Status Card */}
                    <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`rounded-full p-3 ${status.color}`}>
                                        <StatusIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            Statut : {status.label}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {uploadedCount}/{totalRequired} documents téléchargés
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {verificationStatus === 'pending' && allRequiredUploaded && (
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <FileCheck className="mr-2 h-4 w-4" />
                                            {submitting ? 'Envoi...' : 'Soumettre pour vérification'}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Rejection reason */}
                            {verificationStatus === 'rejected' && rejectionReason && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-red-800 dark:text-red-300">
                                                Raison du rejet
                                            </p>
                                            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                                {rejectionReason}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Progress bar */}
                            <div className="mt-4">
                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-500 transition-all duration-300"
                                        style={{ width: `${(uploadedCount / totalRequired) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {documentsList.map((doc) => {
                            const Icon = documentIcons[doc.type] || FileText;
                            const isUploading = uploading === doc.type;

                            return (
                                <Card 
                                    key={doc.type} 
                                    className={`relative overflow-hidden dark:bg-slate-800 dark:border-slate-700 ${
                                        doc.uploaded ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                                    }`}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`rounded-lg p-2 ${
                                                    doc.uploaded 
                                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                                }`}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base dark:text-white">
                                                        {doc.label}
                                                        {doc.required && (
                                                            <span className="text-red-500 ml-1">*</span>
                                                        )}
                                                    </CardTitle>
                                                </div>
                                            </div>
                                            {doc.uploaded && (
                                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                    Téléchargé
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription className="mt-2 dark:text-slate-400">
                                            {doc.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <input
                                            type="file"
                                            ref={(el) => { fileInputRefs.current[doc.type] = el; }}
                                            accept={doc.accept}
                                            onChange={(e) => handleFileSelect(doc.type, e)}
                                            className="hidden"
                                        />

                                        {doc.uploaded ? (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(doc.file_url!, '_blank')}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Voir
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => fileInputRefs.current[doc.type]?.click()}
                                                    disabled={isUploading}
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    {isUploading ? 'Envoi...' : 'Remplacer'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    onClick={() => setDeleteType(doc.type)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full border-dashed"
                                                onClick={() => fileInputRefs.current[doc.type]?.click()}
                                                disabled={isUploading}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                {isUploading ? 'Téléchargement...' : 'Télécharger'}
                                            </Button>
                                        )}

                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                            Formats : JPEG, PNG, PDF • Max {doc.maxSize / 1024} Mo
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Info Card */}
                    <Card className="mt-8 bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-sky-100 dark:bg-sky-900/30 rounded-full p-3">
                                    <Shield className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sky-900 dark:text-sky-100">
                                        Sécurité de vos données
                                    </h3>
                                    <p className="text-sm text-sky-700 dark:text-sky-300 mt-1">
                                        Vos documents sont stockés de manière sécurisée et ne sont accessibles qu'à l'équipe de vérification VIMAIZ. 
                                        Ils ne sont jamais partagés avec des tiers et sont utilisés uniquement pour valider votre identité et votre statut professionnel.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteType} onOpenChange={() => setDeleteType(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Vous devrez télécharger à nouveau le document si vous souhaitez le soumettre.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteType && handleDelete(deleteType)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
