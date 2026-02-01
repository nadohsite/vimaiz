import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Home, Clock, ChevronRight, Filter } from 'lucide-react';

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
        <AppLayout breadcrumbs={[{ title: 'Mes missions', href: route('agent.missions.index') }]}>
            <Head title="Mes missions" />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Mes missions</h1>
                            <p className="text-slate-500 mt-1">Gérez vos missions de ménage</p>
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

                    {missions.data.length > 0 ? (
                        <div className="space-y-4">
                            {missions.data.map((mission) => (
                                <Link key={mission.id} href={route('agent.missions.show', mission.id)}>
                                    <Card className={`hover:shadow-md transition-shadow cursor-pointer ${
                                        mission.status === 'pending_agent' ? 'border-orange-300 bg-orange-50/50' : ''
                                    }`}>
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-2 rounded-lg shrink-0 ${
                                                        mission.status === 'pending_agent' ? 'bg-orange-100' : 'bg-sky-50'
                                                    }`}>
                                                        <Calendar className={`h-6 w-6 ${
                                                            mission.status === 'pending_agent' ? 'text-orange-500' : 'text-sky-500'
                                                        }`} />
                                                    </div>
                                                    <div>
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
                                                                {new Date(mission.scheduled_at).toLocaleDateString('fr-FR', {
                                                                    weekday: 'short',
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-4 w-4" />
                                                                {mission.duration_hours}h
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-green-600">
                                                            {mission.agent_payout} €
                                                        </p>
                                                        <p className="text-xs text-slate-500">Votre gain</p>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-slate-400" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-12">
                            <CardContent>
                                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune mission</h3>
                                <p className="text-slate-500">
                                    {currentStatus ? 'Aucune mission avec ce statut.' : 'Vos missions apparaîtront ici.'}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
