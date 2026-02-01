import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface Booking {
    id: number;
    booking_number: string;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    total_price: number;
    special_instructions: string;
    service: { name: string; description: string };
    agent: { user: { name: string; email: string; phone: string } };
    address: { street_address: string; city: string };
    client: { name: string; email: string; phone: string };
}

interface Props {
    booking: Booking;
}

export default function Show({ booking }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'My Bookings', href: '/bookings' },
            { title: booking.booking_number, href: `/bookings/${booking.id}` }
        ]}>
            <Head title={`Booking #${booking.booking_number}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Booking #{booking.booking_number}
                                </h1>
                                <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide
                                    ${booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                    {booking.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Service Details */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
                                    <dl className="space-y-3">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Service Type</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{booking.service.name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {new Date(booking.scheduled_at).toLocaleString()}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Duration</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{booking.duration_minutes} minutes</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                                            <dd className="mt-1 text-lg font-bold text-indigo-600">{booking.total_price} €</dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Location & Agent */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Agent</h3>
                                    <dl className="space-y-3">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Address</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {booking.address.street_address}, {booking.address.city}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Assigned Agent</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{booking.agent.user.name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Agent Contact</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{booking.agent.user.phone || 'N/A'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {booking.special_instructions && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Instructions</h3>
                                    <div className="bg-yellow-50 p-4 rounded-md text-yellow-800 text-sm">
                                        {booking.special_instructions}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 flex justify-end space-x-4">
                                {booking.status === 'pending' && (
                                    <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                                        Cancel Booking
                                    </button>
                                )}
                                <Link href={route('bookings.index')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                                    Back to List
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
