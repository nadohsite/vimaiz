import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, XCircle, Play, Check, MapPin, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface Mission {
    id: number;
    mission_number: string;
    return_status: string;
    return_reason: string;
    return_requested_at: string;
    return_started_at: string | null;
    return_completed_at: string | null;
    return_validated_at: string | null;
    return_agent_notes: string | null;
    client: {
        id: number;
        name: string;
    };
    property: {
        id: number;
        name: string;
        address_line1: string;
        city: string;
    };
}

interface Props {
    missions: {
        data: Mission[];
        current_page: number;
        last_page: number;
    };
}

const breadcrumbs = [
    { title: 'Dashboard', href: route('agent.dashboard') },
    { title: 'Retours', href: route('agent.returns.index') },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'En attente', color: 'bg-amber-100 text-amber-800', icon: Clock },
    in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: Play },
    completed: { label: 'Effectué', color: 'bg-purple-100 text-purple-800', icon: Check },
    validated: { label: 'Validé', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Refusé', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function AgentReturnsIndex({ missions }: Props) {
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [notes, setNotes] = useState<Record<number, string>>({});

    const handleStartReturn = (missionId: number) => {
        setProcessingId(missionId);
        router.post(route('agent.missions.return-start', missionId), {}, {
            onFinish: () => setProcessingId(null),
        });
    };

    const handleCompleteReturn = (missionId: number) => {
        setProcessingId(missionId);
        router.post(route('agent.missions.return-complete', missionId), {
            notes: notes[missionId] || '',
        }, {
            onFinish: () => setProcessingId(null),
        });
    };

    const getStatusInfo = (status: string) => {
        return statusConfig[status] || statusConfig.pending;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Retours mécontentement" />

            <div className="py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <AlertTriangle className="h-8 w-8 text-amber-500" />
                            Retours mécontentement
                        </h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Gérez les demandes de retour des clients insatisfaits.
                        </p>
                    </div>

                    {missions.data.length === 0 ? (
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-12 text-center">
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                    Aucun retour en attente
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Tous vos clients sont satisfaits ! Continuez votre excellent travail.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {missions.data.map((mission) => {
                                const statusInfo = getStatusInfo(mission.return_status);
                                const StatusIcon = statusInfo.icon;

                                return (
                                    <Card key={mission.id} className="dark:bg-slate-800 dark:border-slate-700">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    Intervention {mission.mission_number}
                                                    <Badge className={statusInfo.color}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusInfo.label}
                                                    </Badge>
                                                </CardTitle>
                                                <span className="text-sm text-slate-500">
                                                    Client: {mission.client.name}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Lieu et date */}
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {mission.property.address_line1}, {mission.property.city}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Demandé le {new Date(mission.return_requested_at).toLocaleDateString('fr-FR')}
                                                </div>
                                            </div>

                                            {/* Raison du retour */}
                                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                                                    Raison du mécontentement :
                                                </h4>
                                                <p className="text-amber-800 dark:text-amber-200">
                                                    {mission.return_reason}
                                                </p>
                                            </div>

                                            {/* Actions selon le statut */}
                                            {mission.return_status === 'pending' && (
                                                <div className="flex justify-end">
                                                    <Button
                                                        onClick={() => handleStartReturn(mission.id)}
                                                        disabled={processingId === mission.id}
                                                        className="bg-blue-500 hover:bg-blue-600"
                                                    >
                                                        <Play className="h-4 w-4 mr-2" />
                                                        {processingId === mission.id ? 'Démarrage...' : 'Démarrer le retour'}
                                                    </Button>
                                                </div>
                                            )}

                                            {mission.return_status === 'in_progress' && (
                                                <div className="space-y-4">
                                                    <Textarea
                                                        placeholder="Notes sur le retour effectué (optionnel)..."
                                                        value={notes[mission.id] || ''}
                                                        onChange={(e) => setNotes({ ...notes, [mission.id]: e.target.value })}
                                                        rows={3}
                                                    />
                                                    <div className="flex justify-end">
                                                        <Button
                                                            onClick={() => handleCompleteReturn(mission.id)}
                                                            disabled={processingId === mission.id}
                                                            className="bg-green-500 hover:bg-green-600"
                                                        >
                                                            <Check className="h-4 w-4 mr-2" />
                                                            {processingId === mission.id ? 'Envoi...' : 'Marquer comme terminé'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {mission.return_status === 'completed' && (
                                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                                    <p className="text-purple-800 dark:text-purple-200 text-sm">
                                                        ⏳ En attente de validation par le client...
                                                    </p>
                                                    {mission.return_agent_notes && (
                                                        <p className="mt-2 text-sm text-purple-700 dark:text-purple-300">
                                                            <strong>Vos notes :</strong> {mission.return_agent_notes}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {mission.return_status === 'validated' && (
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                    <p className="text-green-800 dark:text-green-200 text-sm">
                                                        ✅ Le client a validé le retour. Merci pour votre professionnalisme !
                                                    </p>
                                                </div>
                                            )}

                                            {mission.return_status === 'rejected' && (
                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                    <p className="text-red-800 dark:text-red-200 text-sm">
                                                        ❌ Le client n'est pas satisfait du retour. L'équipe VIMAIZ va examiner le dossier.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
