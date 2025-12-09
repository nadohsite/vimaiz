import { Head, Link } from '@inertiajs/react';
import { Calendar, MapPin, Star } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-neutral-50">
            <Head title="Dashboard" />

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
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('agents.index')}
                                className="text-sm text-neutral-600 hover:text-neutral-900"
                            >
                                Search
                            </Link>
                            <Link
                                href={route('bookings.index')}
                                className="text-sm text-neutral-600 hover:text-neutral-900"
                            >
                                My Bookings
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900">
                        Welcome Back!
                    </h1>
                    <p className="mt-1 text-neutral-600">
                        Manage your bookings and find cleaning services.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Link
                        href={route('agents.index')}
                        className="rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-md"
                    >
                        <div className="mb-4 w-fit rounded-lg bg-indigo-100 p-3">
                            <MapPin className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-neutral-900">
                            Find Agents
                        </h3>
                        <p className="text-sm text-neutral-600">
                            Search for cleaning professionals near you
                        </p>
                    </Link>

                    <Link
                        href={route('bookings.index')}
                        className="rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-md"
                    >
                        <div className="mb-4 w-fit rounded-lg bg-green-100 p-3">
                            <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-neutral-900">
                            My Bookings
                        </h3>
                        <p className="text-sm text-neutral-600">
                            View and manage your appointments
                        </p>
                    </Link>

                    <Link
                        href={route('services.index')}
                        className="rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-md"
                    >
                        <div className="mb-4 w-fit rounded-lg bg-purple-100 p-3">
                            <Star className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-neutral-900">
                            Services
                        </h3>
                        <p className="text-sm text-neutral-600">
                            Browse available cleaning services
                        </p>
                    </Link>
                </div>

                {/* Info Section */}
                <div className="rounded-xl border border-neutral-200 bg-white p-8">
                    <h2 className="mb-4 text-2xl font-bold text-neutral-900">
                        Getting Started
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-indigo-100 p-2">
                                <span className="font-bold text-indigo-600">
                                    1
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900">
                                    Search for Agents
                                </h3>
                                <p className="text-sm text-neutral-600">
                                    Use our map to find verified cleaning
                                    professionals in your area
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-indigo-100 p-2">
                                <span className="font-bold text-indigo-600">
                                    2
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900">
                                    Book a Service
                                </h3>
                                <p className="text-sm text-neutral-600">
                                    Choose your preferred date, time, and
                                    service type
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-indigo-100 p-2">
                                <span className="font-bold text-indigo-600">
                                    3
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900">
                                    Enjoy Your Clean Space
                                </h3>
                                <p className="text-sm text-neutral-600">
                                    Relax while our professionals take care of
                                    everything
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
