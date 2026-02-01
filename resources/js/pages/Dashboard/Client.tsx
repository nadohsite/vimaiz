import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Home, Plus, ClipboardList, FileText, ArrowRight, Euro, Calendar, CheckCircle } from 'lucide-react';

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

export default function Dashboard({ properties = [], activeRequests = [], stats }: DashboardProps) {
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord - VIMAIZ" />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Bienvenue sur VIMAIZ
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Gérez vos logements et demandes de ménage en toute simplicité.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-sky-100 dark:bg-sky-900/50 p-3">
                                <Home className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Logements</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.properties_count ?? properties.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-amber-100 dark:bg-amber-900/50 p-3">
                                <ClipboardList className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Demandes en cours</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.requests_count ?? activeRequests.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-green-100 dark:bg-green-900/50 p-3">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ménages effectués</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.completed_count ?? 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-sm text-white">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-white/20 p-3">
                                <Euro className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-emerald-100">Total dépensé</p>
                                <p className="text-2xl font-bold">{Number(stats?.total_spent ?? 0).toFixed(2)} €</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Actions rapides</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Link
                        href={route('client.requests.create')}
                        className="group rounded-2xl bg-sky-500 p-6 text-white transition-all hover:bg-sky-600 hover:shadow-lg"
                    >
                        <div className="mb-4 w-fit rounded-xl bg-white/20 p-3">
                            <Plus className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Demander un ménage</h3>
                        <p className="text-sm text-sky-100">Planifiez votre prochain ménage</p>
                        <ArrowRight className="mt-4 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                        href={route('client.properties.index')}
                        className="group rounded-2xl bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 transition-all hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-md"
                    >
                        <div className="mb-4 w-fit rounded-xl bg-slate-100 dark:bg-slate-700 p-3">
                            <Home className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Mes logements</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Gérez vos propriétés</p>
                        <ArrowRight className="mt-4 h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                        href={route('client.requests.index')}
                        className="group rounded-2xl bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 transition-all hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-md"
                    >
                        <div className="mb-4 w-fit rounded-xl bg-slate-100 dark:bg-slate-700 p-3">
                            <ClipboardList className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Mes demandes</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Suivez vos demandes</p>
                        <ArrowRight className="mt-4 h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                        href={route('client.missions.index')}
                        className="group rounded-2xl bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 transition-all hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-md"
                    >
                        <div className="mb-4 w-fit rounded-xl bg-slate-100 dark:bg-slate-700 p-3">
                            <FileText className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Historique</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Factures et ménages passés</p>
                        <ArrowRight className="mt-4 h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Recent Properties */}
                {properties.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Mes logements</h2>
                            <Link href={route('client.properties.index')} className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
                                Voir tout →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {properties.slice(0, 3).map((property: any) => (
                                <div key={property.id} className="rounded-2xl bg-white dark:bg-slate-800 p-5 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="inline-flex items-center rounded-full bg-sky-100 dark:bg-sky-900/50 px-2.5 py-0.5 text-xs font-medium text-sky-800 dark:text-sky-300 capitalize">
                                            {property.type}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{property.name || `${property.type} - ${property.city}`}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{property.city}, {property.postal_code}</p>
                                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">{property.surface_area} m² • {property.bedrooms} ch.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {properties.length === 0 && (
                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 border border-slate-200 dark:border-slate-700 text-center">
                        <div className="mx-auto w-fit rounded-full bg-sky-100 dark:bg-sky-900/50 p-4 mb-4">
                            <Home className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Aucun logement enregistré</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Commencez par ajouter votre premier logement pour demander un ménage.</p>
                        <Link
                            href={route('client.properties.create')}
                            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-white font-medium hover:bg-sky-600 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Ajouter un logement
                        </Link>
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
