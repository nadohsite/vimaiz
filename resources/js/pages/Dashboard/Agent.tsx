import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    XCircle,
    BarChart3,
    Star as StarIcon,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const earningsData = [
    { month: 'Jan', total: 1200 },
    { month: 'Fév', total: 1900 },
    { month: 'Mar', total: 1500 },
    { month: 'Avr', total: 2200 },
    { month: 'Mai', total: 1800 },
    { month: 'Juin', total: 2500 },
];

const ratingData = [
    { name: '5 étoiles', value: 45 },
    { name: '4 étoiles', value: 10 },
    { name: '3 étoiles', value: 2 },
];

const COLORS = ['#10b981', '#6366f1', '#f59e0b'];

interface Booking {
    id: number;
    booking_number: string;
    client: { name: string };
    service: { name: string };
    scheduled_at: string;
    duration_minutes: number;
    total_price: number;
    status: string;
}

interface Stats {
    total_earnings: number;
    pending_earnings: number;
    completed_jobs: number;
    pending_jobs: number;
    average_rating: number;
    total_reviews: number;
}

interface Props {
    stats: Stats;
    upcoming_bookings: Booking[];
    recent_bookings: Booking[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de bord',
        href: '/agent/dashboard',
    },
];

export default function AgentDashboard({
    stats,
    upcoming_bookings,
    recent_bookings,
}: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'in_progress':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'cancelled':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Terminé';
            case 'in_progress': return 'En cours';
            case 'pending': return 'En attente';
            case 'cancelled': return 'Annulé';
            case 'accepted': return 'Accepté';
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord Agent" />

            <div className="p-4 space-y-8 sm:p-6 lg:p-8">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                        Tableau de bord Agent
                    </h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                        Bon retour ! Voici un aperçu de vos performances et gains.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30 text-green-600">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-neutral-500">Gains Totaux</span>
                        </div>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            {stats.total_earnings.toFixed(2)} MAD
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30 text-yellow-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-neutral-500">Gains en Attente</span>
                        </div>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            {stats.pending_earnings.toFixed(2)} MAD
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30 text-blue-600">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-neutral-500">Missions</span>
                        </div>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            {stats.completed_jobs}
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30 text-indigo-600">
                                <StarIcon className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-neutral-500">Note Moyenne</span>
                        </div>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            4.8/5
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Revenus Mensuels</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={earningsData}>
                                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip 
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChartIcon className="h-5 w-5 text-green-600" />
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Analyse des Avis</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={ratingData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {ratingData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                {ratingData.map((item, index) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                        <span className="text-xs text-neutral-600 dark:text-neutral-400">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Upcoming Jobs */}
                    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                Missions à Venir
                            </h2>
                            <Link
                                href={route('agent.bookings.index')}
                                className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                                Voir Tout
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {upcoming_bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 transition-colors hover:border-indigo-300"
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div>
                                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                {booking.client.name}
                                            </div>
                                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {booking.service.name}
                                            </div>
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}
                                        >
                                            {getStatusLabel(booking.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(
                                                booking.scheduled_at,
                                            ).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {booking.duration_minutes / 60}h
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4" />
                                            {booking.total_price} MAD
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <Link
                                            href={route(
                                                'client.bookings.show',
                                                booking.id,
                                            )}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                        >
                                            Voir Détails →
                                        </Link>
                                    </div>
                                </div>
                            ))}

                            {upcoming_bookings.length === 0 && (
                                <div className="py-8 text-center text-neutral-500">
                                    <Calendar className="mx-auto mb-3 h-12 w-12 text-neutral-300 dark:text-neutral-700" />
                                    <p>Aucune mission à venir</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-neutral-900">
                                Activité Récente
                            </h2>
                            <Link
                                href={route('agent.bookings.index')}
                                className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                                Voir Tout
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recent_bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="flex items-center gap-4 border-b border-neutral-100 pb-4 last:border-0 last:pb-0"
                                >
                                    <div
                                        className={`rounded-lg p-2 ${getStatusColor(booking.status)}`}
                                    >
                                        {getStatusIcon(booking.status)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium text-neutral-900">
                                            {booking.service.name}
                                        </div>
                                        <div className="text-sm text-neutral-600">
                                            {booking.client.name}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-neutral-900">
                                            {booking.total_price} MAD
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            {new Date(
                                                booking.scheduled_at,
                                            ).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {recent_bookings.length === 0 && (
                                <div className="py-8 text-center text-neutral-500">
                                    <AlertCircle className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                                    <p>Aucune activité récente</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
