import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, MapPin, Star, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import {
    Area,
    AreaChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const spendingData = [
    { month: 'Jan', total: 400 },
    { month: 'Fév', total: 300 },
    { month: 'Mar', total: 600 },
    { month: 'Avr', total: 800 },
    { month: 'Mai', total: 500 },
    { month: 'Juin', total: 900 },
];

const serviceData = [
    { name: 'Nettoyage Standard', value: 400 },
    { name: 'Nettoyage Profond', value: 300 },
    { name: 'Repassage', value: 200 },
    { name: 'Vitre', value: 100 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de bord',
        href: '/dashboard',
    },
];

export default function Dashboard({ activeBookings = [], properties = [] }: any) {
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord" />

            <div className="p-4 space-y-8 sm:p-6 lg:p-8">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                        Bienvenue !
                    </h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                        Gérez vos réservations et suivez vos statistiques de nettoyage.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6">
                        <p className="text-sm font-medium text-neutral-500">Total Dépensé</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">3,700 MAD</p>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6">
                        <p className="text-sm font-medium text-neutral-500">Réservations</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">12</p>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6">
                        <p className="text-sm font-medium text-neutral-500">Heures de service</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">48h</p>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6">
                        <p className="text-sm font-medium text-neutral-500">Economisé</p>
                        <p className="text-2xl font-bold text-indigo-600 mt-1">15%</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Dépenses Mensuelles</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={spendingData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} MAD`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        labelStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#6366f1" fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChartIcon className="h-5 w-5 text-green-600" />
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Répartition des Services</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={serviceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {serviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                {serviceData.map((item, index) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                        <span className="text-xs text-neutral-600 dark:text-neutral-400">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Rapides */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Link
                        href={route('client.search')}
                        className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6 transition-all hover:border-indigo-300 hover:shadow-md"
                    >
                        <div className="mb-4 w-fit rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
                            <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            Trouver un Agent
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Recherchez des professionnels près de chez vous
                        </p>
                    </Link>

                    <Link
                        href={route('client.bookings.index')}
                        className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6 transition-all hover:border-indigo-300 hover:shadow-md"
                    >
                        <div className="mb-4 w-fit rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                            <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            Mes Réservations
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Consultez et gérez vos rendez-vous
                        </p>
                    </Link>

                    <Link
                        href={route('services.index')}
                        className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6 transition-all hover:border-indigo-300 hover:shadow-md"
                    >
                        <div className="mb-4 w-fit rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                            <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            Services
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Parcourez nos services de nettoyage disponibles
                        </p>
                    </Link>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
