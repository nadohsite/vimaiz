import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Home, Plus, ClipboardList, FileText, ArrowRight } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de bord',
        href: '/dashboard',
    },
];

interface DashboardProps {
    properties?: any[];
    activeRequests?: any[];
    stats?: {
        properties_count: number;
        requests_count: number;
        completed_count: number;
    };
}

export default function Dashboard({ properties = [], activeRequests = [], stats }: DashboardProps) {
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord - VIMAIZ" />

            <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Bienvenue sur VIMAIZ
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Gérez vos logements et demandes de ménage en toute simplicité.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-sky-100 p-3">
                                <Home className="h-6 w-6 text-sky-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Logements</p>
                                <p className="text-2xl font-bold text-slate-900">{stats?.properties_count ?? properties.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-amber-100 p-3">
                                <ClipboardList className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Demandes en cours</p>
                                <p className="text-2xl font-bold text-slate-900">{stats?.requests_count ?? activeRequests.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-green-100 p-3">
                                <FileText className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Ménages effectués</p>
                                <p className="text-2xl font-bold text-slate-900">{stats?.completed_count ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Actions rapides</h2>
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
                        className="group rounded-2xl bg-white p-6 border border-slate-200 transition-all hover:border-sky-300 hover:shadow-md"
                    >
                        <div className="mb-4 w-fit rounded-xl bg-slate-100 p-3">
                            <Home className="h-6 w-6 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">Mes logements</h3>
                        <p className="text-sm text-slate-500">Gérez vos propriétés</p>
                        <ArrowRight className="mt-4 h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                        href={route('client.requests.index')}
                        className="group rounded-2xl bg-white p-6 border border-slate-200 transition-all hover:border-sky-300 hover:shadow-md"
                    >
                        <div className="mb-4 w-fit rounded-xl bg-slate-100 p-3">
                            <ClipboardList className="h-6 w-6 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">Mes demandes</h3>
                        <p className="text-sm text-slate-500">Suivez vos demandes</p>
                        <ArrowRight className="mt-4 h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                        href={route('client.missions.index')}
                        className="group rounded-2xl bg-white p-6 border border-slate-200 transition-all hover:border-sky-300 hover:shadow-md"
                    >
                        <div className="mb-4 w-fit rounded-xl bg-slate-100 p-3">
                            <FileText className="h-6 w-6 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">Historique</h3>
                        <p className="text-sm text-slate-500">Factures et ménages passés</p>
                        <ArrowRight className="mt-4 h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Recent Properties */}
                {properties.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-slate-900">Mes logements</h2>
                            <Link href={route('client.properties.index')} className="text-sm font-medium text-sky-600 hover:text-sky-700">
                                Voir tout →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {properties.slice(0, 3).map((property: any) => (
                                <div key={property.id} className="rounded-2xl bg-white p-5 border border-slate-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800 capitalize">
                                            {property.type}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-1">{property.name || `${property.type} - ${property.city}`}</h3>
                                    <p className="text-sm text-slate-500">{property.city}, {property.postal_code}</p>
                                    <p className="text-sm text-slate-400 mt-2">{property.surface_area} m² • {property.bedrooms} ch.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {properties.length === 0 && (
                    <div className="rounded-2xl bg-white p-8 border border-slate-200 text-center">
                        <div className="mx-auto w-fit rounded-full bg-sky-100 p-4 mb-4">
                            <Home className="h-8 w-8 text-sky-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun logement enregistré</h3>
                        <p className="text-slate-500 mb-4">Commencez par ajouter votre premier logement pour demander un ménage.</p>
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
