import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    ClipboardList,
    Euro,
    FileText,
    Home,
    MapPin,
    Plus,
    Sparkles,
    User,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de bord',
        href: '/dashboard',
    },
];

interface Mission {
    id: number;
    mission_number: string;
    scheduled_at: string;
    completed_at: string | null;
    total_price: number;
    status: string;
    property: {
        name: string | null;
        type: string;
        city: string;
    };
    agent: {
        name: string;
    } | null;
}

interface DashboardProps {
    properties?: any[];
    activeRequests?: any[];
    upcomingMissions?: Mission[];
    recentMissions?: Mission[];
    stats?: {
        properties_count: number;
        requests_count: number;
        completed_count: number;
        total_spent: number;
    };
}

const MISSION_STATUS: Record<string, { label: string; className: string }> = {
    pending_agent: {
        label: 'Intervention en attente',
        className:
            'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    },
    agent_accepted: {
        label: 'Intervention confirmée',
        className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    },
    in_progress: {
        label: 'En cours',
        className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    },
    completed: {
        label: 'Terminé',
        className:
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
};

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function MissionRow({ mission }: { mission: Mission }) {
    const status = MISSION_STATUS[mission.status] ?? {
        label: mission.status,
        className:
            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    };

    return (
        <Link
            href={route('client.missions.show', mission.id)}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary/40"
        >
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900 dark:text-white">
                    {mission.property.name ||
                        `${mission.property.type} — ${mission.property.city}`}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(mission.completed_at ?? mission.scheduled_at)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {mission.property.city}
                    </span>
                    {mission.agent && (
                        <span className="inline-flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {mission.agent.name}
                        </span>
                    )}
                </p>
            </div>
            <div className="flex flex-none flex-col items-end gap-1.5">
                <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.className}`}
                >
                    {status.label}
                </span>
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                    {Number(mission.total_price).toFixed(0)} €
                </span>
            </div>
        </Link>
    );
}

export default function Dashboard({
    properties = [],
    activeRequests = [],
    upcomingMissions = [],
    recentMissions = [],
    stats,
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const firstName = auth.user?.first_name || auth.user?.name?.split(' ')[0] || '';

    const statCards = [
        {
            icon: Home,
            label: 'Biens',
            value: stats?.properties_count ?? properties.length,
            iconClass: 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400',
        },
        {
            icon: ClipboardList,
            label: 'Demandes en cours',
            value: stats?.requests_count ?? activeRequests.length,
            iconClass:
                'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
        },
        {
            icon: CheckCircle,
            label: 'Interventions effectuées',
            value: stats?.completed_count ?? 0,
            iconClass:
                'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
        },
        {
            icon: Euro,
            label: 'Total dépensé',
            value: `${Number(stats?.total_spent ?? 0).toFixed(2)} €`,
            iconClass: 'bg-primary/10 text-primary',
        },
    ];

    const quickLinks = [
        {
            href: route('client.properties.index'),
            icon: Home,
            title: 'Mes biens',
            description: 'Gérez vos propriétés',
        },
        {
            href: route('client.requests.index'),
            icon: ClipboardList,
            title: 'Mes demandes',
            description: 'Suivez vos demandes',
        },
        {
            href: route('client.missions.index'),
            icon: FileText,
            title: 'Historique',
            description: 'Factures et interventions passées',
        },
    ];

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord - VIMAIZ" />

            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 p-3 dark:from-slate-900 dark:to-slate-950 sm:p-6 lg:p-8">
                {/* Welcome banner */}
                <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:mb-8 sm:p-8">
                    <div
                        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
                        aria-hidden="true"
                    />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                Bonjour{firstName ? ` ${firstName}` : ''}
                            </h1>
                            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                                Gérez vos biens et interventions en toute simplicité.
                            </p>
                        </div>
                        <Link
                            href={route('client.requests.create')}
                            className="group inline-flex w-full flex-none items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 sm:w-auto sm:px-6 sm:text-base"
                        >
                            <Plus className="h-5 w-5" />
                            Nouvelle intervention
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`rounded-xl p-3 ${card.iconClass}`}>
                                    <card.icon className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {card.label}
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {card.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                    {/* Missions column */}
                    <div className="space-y-8 xl:col-span-2">
                        {/* Upcoming */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Prochaines interventions
                                </h2>
                                <Link
                                    href={route('client.missions.index')}
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    Voir tout →
                                </Link>
                            </div>
                            {upcomingMissions.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingMissions.map((mission) => (
                                        <MissionRow key={mission.id} mission={mission} />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-800">
                                    <div className="mx-auto mb-3 w-fit rounded-full bg-primary/10 p-3">
                                        <Calendar className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        Aucune intervention planifiée
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Programmez votre prochaine intervention en quelques clics.
                                    </p>
                                    <Link
                                        href={route('client.requests.create')}
                                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Nouvelle intervention
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* Recent */}
                        {recentMissions.length > 0 && (
                            <section>
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        Dernières interventions effectuées
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    {recentMissions.map((mission) => (
                                        <MissionRow key={mission.id} mission={mission} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Side column */}
                    <div className="space-y-8">
                        {/* Quick links */}
                        <section>
                            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                                Accès rapide
                            </h2>
                            <div className="space-y-3">
                                {quickLinks.map((link) => (
                                    <Link
                                        key={link.title}
                                        href={link.href}
                                        className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                                    >
                                        <div className="rounded-xl bg-slate-100 p-2.5 transition-colors group-hover:bg-primary/10 dark:bg-slate-700">
                                            <link.icon className="h-5 w-5 text-slate-600 transition-colors group-hover:text-primary dark:text-slate-300" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {link.title}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {link.description}
                                            </p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 flex-none text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Properties */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Mes biens
                                </h2>
                                {properties.length > 0 && (
                                    <Link
                                        href={route('client.properties.index')}
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        Voir tout →
                                    </Link>
                                )}
                            </div>
                            {properties.length > 0 ? (
                                <div className="space-y-3">
                                    {properties.slice(0, 3).map((property: any) => (
                                        <div
                                            key={property.id}
                                            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                                        >
                                            <span className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                                                {property.type}
                                            </span>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                {property.name ||
                                                    `${property.type} - ${property.city}`}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {property.city}, {property.postal_code}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                                {property.surface_area} m² • {property.bedrooms}{' '}
                                                ch.
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-800">
                                    <div className="mx-auto mb-3 w-fit rounded-full bg-primary/10 p-3">
                                        <Home className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        Aucun bien enregistré
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Ajoutez votre premier bien pour programmer une intervention.
                                    </p>
                                    <Link
                                        href={route('client.properties.create')}
                                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Ajouter un bien
                                    </Link>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
