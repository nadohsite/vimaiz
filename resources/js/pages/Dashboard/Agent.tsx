import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Briefcase, Clock, CheckCircle, Euro, ArrowRight, MapPin, Calendar } from 'lucide-react';
import RcpClauseModal from '@/components/RcpClauseModal';
import { useState } from 'react';

interface Mission {
    id: number;
    mission_number: string;
    scheduled_at: string;
    total_price: number;
    agent_payout: number;
    status: string;
    service_request: {
        property: {
            type: string;
            city: string;
            address: string;
        };
        client: {
            name: string;
        };
        requested_hours: number;
    };
}

interface Stats {
    pending_count: number;
    active_count: number;
    completed_count: number;
    total_earned: number;
}

interface Props {
    pendingMissions?: Mission[];
    activeMissions?: Mission[];
    stats?: Stats;
    rcpClauseAccepted?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de bord',
        href: '/agent/dashboard',
    },
];

export default function AgentDashboard({ pendingMissions = [], activeMissions = [], stats, rcpClauseAccepted = false }: Props) {
    const [showRcpModal, setShowRcpModal] = useState(!rcpClauseAccepted);
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'in_progress':
                return 'bg-sky-100 text-sky-700';
            case 'agent_accepted':
                return 'bg-blue-100 text-blue-700';
            case 'pending_agent':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Terminée';
            case 'in_progress': return 'En cours';
            case 'agent_accepted': return 'Acceptée';
            case 'pending_agent': return 'En attente';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord Agent - VIMAIZ" />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Espace Agent VIMAIZ
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Gérez vos missions de ménage et suivez vos revenus.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-amber-100 dark:bg-amber-900/50 p-3">
                                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">En attente</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.pending_count ?? pendingMissions.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-sky-100 dark:bg-sky-900/50 p-3">
                                <Briefcase className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">En cours</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.active_count ?? activeMissions.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-green-100 dark:bg-green-900/50 p-3">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Terminées</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.completed_count ?? 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900/50 p-3">
                                <Euro className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total gagné</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{Number(stats?.total_earned ?? 0).toFixed(2)} €</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Missions */}
                {pendingMissions.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                Missions en attente de votre réponse
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {pendingMissions.map((mission) => (
                                <div key={mission.id} className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(mission.status)}`}>
                                            {getStatusLabel(mission.status)}
                                        </span>
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">{mission.agent_payout} €</span>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 capitalize">
                                        {mission.service_request?.property?.type} - {mission.service_request?.property?.city}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                        Client : {mission.service_request?.client?.name}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(mission.scheduled_at)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {mission.service_request?.requested_hours}h
                                        </span>
                                    </div>
                                    <Link
                                        href={route('agent.missions.show', mission.id)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
                                    >
                                        Voir et répondre
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Missions */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Missions en cours</h2>
                        <Link href={route('agent.missions.index')} className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
                            Toutes les missions →
                        </Link>
                    </div>
                    {activeMissions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {activeMissions.map((mission) => (
                                <Link
                                    key={mission.id}
                                    href={route('agent.missions.show', mission.id)}
                                    className="group rounded-2xl bg-white dark:bg-slate-800 p-5 border border-slate-200 dark:border-slate-700 transition-all hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(mission.status)}`}>
                                            {getStatusLabel(mission.status)}
                                        </span>
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">{mission.agent_payout} €</span>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 capitalize">
                                        {mission.service_request?.property?.type} - {mission.service_request?.property?.city}
                                    </h3>
                                    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-2">
                                        <MapPin className="h-4 w-4" />
                                        {mission.service_request?.property?.address}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(mission.scheduled_at)}
                                        </span>
                                    </div>
                                    <ArrowRight className="mt-4 h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 border border-slate-200 dark:border-slate-700 text-center">
                            <div className="mx-auto w-fit rounded-full bg-slate-100 dark:bg-slate-700 p-4 mb-4">
                                <Briefcase className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Aucune mission en cours</h3>
                            <p className="text-slate-500 dark:text-slate-400">Les nouvelles missions vous seront proposées ici.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RCP Clause Modal */}
            <RcpClauseModal 
                show={showRcpModal} 
                onAccepted={() => setShowRcpModal(false)} 
            />
        </AppSidebarLayout>
    );
}
