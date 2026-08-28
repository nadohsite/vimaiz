import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Home, Clock, ChevronRight, Filter } from 'lucide-react';
import { formatAppointmentDateTime } from '@/lib/datetime';
import { AgentProposalActions } from '@/components/missions/AgentProposalActions';

interface Property {
    id: number;
    name: string | null;
    type_label: string;
    city: string;
    address_line1: string;
}

interface Client {
    id: number;
    name: string;
}

interface Mission {
    id: number;
    mission_number: string;
    scheduled_at: string;
    duration_hours: number;
    agent_payout: number;
    status: string;
    status_label: string;
    property: Property;
    client: Client;
}

interface Props {
    missions: {
        data: Mission[];
        links: any[];
    };
    currentStatus: string | null;
    statuses: Record<string, string>;
}

export default function Index({ missions, currentStatus, statuses }: Props) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string; info?: string } }>().props;

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending_agent: 'bg-orange-100 text-orange-800 border-orange-200',
            agent_accepted: 'bg-blue-100 text-blue-800 border-blue-200',
            in_progress: 'bg-sky-100 text-sky-800 border-sky-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const handleStatusChange = (value: string) => {
        router.get(route('agent.missions.index'), value ? { status: value } : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Mes interventions', href: route('agent.missions.index') }]}>
            <Head title="Mes interventions" />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Mes interventions</h1>
                            <p className="text-slate-500 mt-1">Gérez vos interventions</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-500" />
                            <Select value={currentStatus || 'all'} onValueChange={(v) => handleStatusChange(v === 'all' ? '' : v)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrer par statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    {Object.entries(statuses || {}).filter(([key]) => key !== '').map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {(flash?.success || flash?.info || flash?.error) && (
                        <div className="mb-6 space-y-3">
                            {(flash.success || flash.info) && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                                    {flash.success || flash.info}
                                </div>
                            )}
                            {flash.error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                                    {flash.error}
                                </div>
                            )}
                        </div>
                    )}

                    {missions.data.length > 0 ? (
                        <div className="space-y-4">
                            {missions.data.map((mission) => (
                                <Card
                                    key={mission.id}
                                    className={`transition-shadow ${
                                        mission.status === 'pending_agent' ? 'border-orange-300 bg-orange-50/50' : 'hover:shadow-md'
                                    }`}
                                >
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <Link
                                                href={route('agent.missions.show', mission.id)}
                                                className="flex items-start gap-4 min-w-0 flex-1"
                                            >
                                                <div className={`p-2 rounded-lg shrink-0 ${
                                                    mission.status === 'pending_agent' ? 'bg-orange-100' : 'bg-sky-50'
                                                }`}>
                                                    <Calendar className={`h-6 w-6 ${
                                                        mission.status === 'pending_agent' ? 'text-orange-500' : 'text-sky-500'
                                                    }`} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-slate-900">
                                                            {mission.mission_number}
                                                        </span>
                                                        <Badge className={getStatusColor(mission.status)}>
                                                            {mission.status_label}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                                                        <span className="flex items-center gap-1">
                                                            <Home className="h-4 w-4" />
                                                            {mission.property.city}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {formatAppointmentDateTime(mission.scheduled_at)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {mission.duration_hours}h
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                            <div className="flex flex-col items-stretch sm:items-end gap-3">
                                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-green-600">
                                                            {mission.agent_payout} €
                                                        </p>
                                                        <p className="text-xs text-slate-500">Votre gain</p>
                                                    </div>
                                                    {mission.status !== 'pending_agent' && (
                                                        <Link href={route('agent.missions.show', mission.id)}>
                                                            <ChevronRight className="h-5 w-5 text-slate-400" />
                                                        </Link>
                                                    )}
                                                </div>
                                                {mission.status === 'pending_agent' && (
                                                    <AgentProposalActions missionId={mission.id} variant="compact" />
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-12">
                            <CardContent>
                                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune intervention</h3>
                                <p className="text-slate-500">
                                    {currentStatus ? 'Aucune intervention avec ce statut.' : 'Vos interventions apparaîtront ici.'}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
