import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Clock, DollarSign, Star } from 'lucide-react';
import { useState } from 'react';

interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    client: {
        name: string;
        avatar: string;
    };
}

interface TimeSlot {
    start_time: string;
    end_time: string;
    is_available: boolean;
}

interface DayAvailability {
    date: string;
    day_of_week: number;
    slots: TimeSlot[];
}

interface Agent {
    id: number;
    user: {
        name: string;
        avatar: string;
    };
    hourly_rate: number;
    average_rating: number;
    description: string;
    experience_years: number;
    services: Array<{ id: number; name: string }>;
    reviews: Review[];
}

interface Props {
    agent: Agent;
    availabilities: DayAvailability[];
}

export default function Show({ agent, availabilities }: Props) {
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    const handleSlotSelect = (date: string, slot: TimeSlot) => {
        setSelectedDate(date);
        setSelectedSlot(slot);
        setShowBookingModal(true);
    };

    const handleBooking = () => {
        if (selectedDate && selectedSlot) {
            router.visit(route('bookings.create'), {
                method: 'get',
                data: {
                    agent_id: agent.id,
                    date: selectedDate,
                    start_time: selectedSlot.start_time,
                    end_time: selectedSlot.end_time,
                },
            });
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <Head title={`${agent.user.name} - Profile`} />

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
                        <Link
                            href={route('agents.index')}
                            className="text-sm text-neutral-600 hover:text-neutral-900"
                        >
                            ← Back to Search
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column: Profile Info */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="rounded-xl border border-neutral-200 bg-white p-6">
                            <div className="mb-6 text-center">
                                <div className="relative inline-block">
                                    <img
                                        src={
                                            agent.user.avatar ||
                                            `https://ui-avatars.com/api/?name=${agent.user.name}&size=128`
                                        }
                                        alt={agent.user.name}
                                        className="mx-auto mb-4 h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
                                    />
                                </div>
                                <h1 className="mb-1 text-2xl font-bold text-neutral-900">
                                    {agent.user.name}
                                </h1>
                                <div className="flex items-center justify-center gap-1 text-yellow-400">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="font-bold text-neutral-900">
                                        {agent.average_rating}
                                    </span>
                                    <span className="text-neutral-400">
                                        ({agent.reviews.length} reviews)
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-neutral-100 pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-neutral-600">
                                        <DollarSign className="h-5 w-5" />
                                        <span>Hourly Rate</span>
                                    </div>
                                    <span className="font-bold text-neutral-900">
                                        {agent.hourly_rate} MAD
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-neutral-600">
                                        <Clock className="h-5 w-5" />
                                        <span>Experience</span>
                                    </div>
                                    <span className="font-bold text-neutral-900">
                                        {agent.experience_years} Years
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="block w-full rounded-xl bg-neutral-900 px-6 py-3 text-center font-medium text-white shadow-lg transition hover:bg-neutral-800"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>

                        {/* Services */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-6">
                            <h3 className="mb-4 text-lg font-bold text-neutral-900">
                                Services Offered
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {agent.services.map((service) => (
                                    <span
                                        key={service.id}
                                        className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                                    >
                                        {service.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & Calendar */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* About */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-6">
                            <h2 className="mb-4 text-xl font-bold text-neutral-900">
                                About Me
                            </h2>
                            <p className="leading-relaxed whitespace-pre-line text-neutral-600">
                                {agent.description}
                            </p>
                        </div>

                        {/* Availability Calendar */}
                        <AvailabilityCalendar
                            availabilities={availabilities}
                            onSelectSlot={handleSlotSelect}
                        />

                        {/* Reviews */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-6">
                            <h2 className="mb-6 text-xl font-bold text-neutral-900">
                                Client Reviews
                            </h2>
                            <div className="space-y-6">
                                {agent.reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="border-b border-neutral-100 pb-6 last:border-0 last:pb-0"
                                    >
                                        <div className="mb-2 flex items-center">
                                            <div className="mr-2 font-medium text-neutral-900">
                                                {review.client.name}
                                            </div>
                                            <div className="flex text-sm text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400' : ''}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="ml-auto text-sm text-neutral-400">
                                                {new Date(
                                                    review.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-neutral-600">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                                {agent.reviews.length === 0 && (
                                    <p className="py-8 text-center text-neutral-500 italic">
                                        No reviews yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6">
                        <h3 className="mb-4 text-2xl font-bold text-neutral-900">
                            Confirm Booking
                        </h3>

                        {selectedDate && selectedSlot ? (
                            <div className="space-y-4">
                                <div className="space-y-3 rounded-xl bg-neutral-50 p-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-neutral-600" />
                                        <div>
                                            <div className="text-sm text-neutral-600">
                                                Date
                                            </div>
                                            <div className="font-medium text-neutral-900">
                                                {new Date(
                                                    selectedDate,
                                                ).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-neutral-600" />
                                        <div>
                                            <div className="text-sm text-neutral-600">
                                                Time
                                            </div>
                                            <div className="font-medium text-neutral-900">
                                                {selectedSlot.start_time} -{' '}
                                                {selectedSlot.end_time}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="h-5 w-5 text-neutral-600" />
                                        <div>
                                            <div className="text-sm text-neutral-600">
                                                Rate
                                            </div>
                                            <div className="font-medium text-neutral-900">
                                                {agent.hourly_rate} MAD/hour
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() =>
                                            setShowBookingModal(false)
                                        }
                                        className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 font-medium text-neutral-700 transition hover:bg-neutral-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleBooking}
                                        className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 font-medium text-white transition hover:bg-neutral-800"
                                    >
                                        Continue to Booking
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="mb-4 text-neutral-600">
                                    Please select a date and time slot from the
                                    calendar.
                                </p>
                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    className="rounded-xl bg-neutral-900 px-6 py-2 font-medium text-white transition hover:bg-neutral-800"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
