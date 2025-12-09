import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    XCircle,
} from 'lucide-react';

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

export default function AgentDashboard({
    stats,
    upcoming_bookings,
    recent_bookings,
}: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'in_progress':
                return 'bg-blue-100 text-blue-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-neutral-100 text-neutral-700';
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
        <div className="min-h-screen bg-neutral-50">
            <Head title="Agent Dashboard" />

            {/* Header */}
            <nav className="border-b border-neutral-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link
                            href={route('home')}
                            className="flex items-center gap-2"
                        >
                            <div className="rounded-md bg-indigo-600 p-1">
                                <span className="text-sm font-bold text-white">
                                    V
                                </span>
                            </div>
                            <span className="text-xl font-bold text-neutral-900">
                                VIMAIZ
                            </span>
                            <span className="ml-2 text-sm text-neutral-500">
                                Agent Portal
                            </span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('agent.wallet')}
                                className="text-sm text-neutral-600 hover:text-neutral-900"
                            >
                                Wallet
                            </Link>
                            <Link
                                href={route('agent.bookings')}
                                className="text-sm text-neutral-600 hover:text-neutral-900"
                            >
                                My Jobs
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-neutral-600">
                        Welcome back! Here's your performance overview.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-neutral-200 bg-white p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="rounded-lg bg-green-100 p-3">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-neutral-900">
                            {stats.total_earnings.toFixed(2)} MAD
                        </div>
                        <div className="text-sm text-neutral-600">
                            Total Earnings
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="rounded-lg bg-yellow-100 p-3">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-neutral-900">
                            {stats.pending_earnings.toFixed(2)} MAD
                        </div>
                        <div className="text-sm text-neutral-600">
                            Pending Earnings
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="rounded-lg bg-blue-100 p-3">
                                <CheckCircle className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-neutral-900">
                            {stats.completed_jobs}
                        </div>
                        <div className="text-sm text-neutral-600">
                            Completed Jobs
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-neutral-900">
                                Upcoming Jobs
                            </h2>
                            <Link
                                href={route('agent.bookings')}
                                className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                                View All
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {upcoming_bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="rounded-xl border border-neutral-200 p-4 transition-colors hover:border-indigo-300"
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div>
                                            <div className="font-medium text-neutral-900">
                                                {booking.client.name}
                                            </div>
                                            <div className="text-sm text-neutral-600">
                                                {booking.service.name}
                                            </div>
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}
                                        >
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(
                                                booking.scheduled_at,
                                            ).toLocaleDateString()}
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
                                                'bookings.show',
                                                booking.id,
                                            )}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                        >
                                            View Details →
                                        </Link>
                                    </div>
                                </div>
                            ))}

                            {upcoming_bookings.length === 0 && (
                                <div className="py-8 text-center text-neutral-500">
                                    <Calendar className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                                    <p>No upcoming jobs</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-neutral-900">
                                Recent Activity
                            </h2>
                            <Link
                                href={route('agent.bookings')}
                                className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                                View All
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
                                            ).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {recent_bookings.length === 0 && (
                                <div className="py-8 text-center text-neutral-500">
                                    <AlertCircle className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                                    <p>No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
