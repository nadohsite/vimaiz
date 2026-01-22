import StripePayment from '@/components/StripePayment';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
} from 'lucide-react';
import { useState } from 'react';

interface Agent {
    id: number;
    user: { name: string; avatar?: string };
    hourly_rate: number;
}

interface Service {
    id: number;
    name: string;
    base_price: number;
    description?: string;
}

interface Address {
    id: number;
    street_address: string;
    city: string;
    postal_code?: string;
    label?: string;
}

interface Props {
    agent?: Agent;
    service?: Service;
    services: Service[];
    user_addresses: Address[];
    date?: string;
    start_time?: string;
    end_time?: string;
}

export default function Create({
    agent,
    service,
    services,
    user_addresses,
    date,
    start_time,
    end_time,
}: Props) {
    const [step, setStep] = useState(1);
    const [bookingId, setBookingId] = useState<number | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        agent_id: agent?.id || '',
        service_id: service?.id || '',
        address_id: '',
        scheduled_at: date && start_time ? `${date}T${start_time}` : '',
        duration_minutes: 120,
        special_instructions: '',
    });

    const totalSteps = 5;

    const selectedService = services.find(
        (s) => s.id === Number(data.service_id),
    );
    const selectedAddress = user_addresses.find(
        (a) => a.id === Number(data.address_id),
    );

    const estimatedPrice = selectedService
        ? selectedService.base_price * (data.duration_minutes / 60)
        : 0;
    const totalPrice = estimatedPrice * 1.1; // Include 10% platform fee

    const canProceed = () => {
        switch (step) {
            case 1:
                return data.service_id !== '';
            case 2:
                return data.scheduled_at !== '' && data.duration_minutes > 0;
            case 3:
                return data.address_id !== '';
            case 4:
                return true; // Review step
            case 5:
                return bookingId !== null; // Payment step
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (step === 4 && !bookingId) {
            // Create booking before going to payment
            submitBooking();
        } else if (canProceed() && step < totalSteps) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 1 && step !== 5) {
            // Can't go back from payment
            setStep(step - 1);
        }
    };

    const submitBooking = () => {
        post(route('bookings.store'), {
            preserveScroll: true,
            onSuccess: (page: any) => {
                const booking = page.props.booking || page.props.flash?.booking;
                if (booking?.id) {
                    setBookingId(booking.id);
                    setStep(5); // Move to payment step
                }
            },
        });
    };

    const handlePaymentSuccess = () => {
        setPaymentSuccess(true);
        setTimeout(() => {
            router.visit(route('bookings.show', bookingId!));
        }, 2000);
    };

    const handlePaymentError = (error: string) => {
        console.error('Payment error:', error);
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <Head title="Book a Service" />

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
                            href={
                                agent
                                    ? route('agents.show', agent.id)
                                    : route('agents.index')
                            }
                            className="text-sm text-neutral-600 hover:text-neutral-900"
                        >
                            ← Back
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[
                            { num: 1, label: 'Service' },
                            { num: 2, label: 'Date & Time' },
                            { num: 3, label: 'Address' },
                            { num: 4, label: 'Review' },
                            { num: 5, label: 'Payment' },
                        ].map((s, idx) => (
                            <div
                                key={s.num}
                                className="flex flex-1 items-center"
                            >
                                <div className="flex flex-1 flex-col items-center">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                                            step >= s.num
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-neutral-200 text-neutral-600'
                                        }`}
                                    >
                                        {step > s.num ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : (
                                            s.num
                                        )}
                                    </div>
                                    <span
                                        className={`mt-2 text-xs font-medium ${step >= s.num ? 'text-neutral-900' : 'text-neutral-500'}`}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                                {idx < 4 && (
                                    <div
                                        className={`mx-2 h-0.5 flex-1 ${step > s.num ? 'bg-indigo-600' : 'bg-neutral-200'}`}
                                    ></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    {/* Agent Info (if selected) */}
                    {agent && (
                        <div className="border-b border-indigo-100 bg-indigo-50 p-6">
                            <div className="flex items-center gap-4">
                                <img
                                    src={
                                        agent.user.avatar ? `/storage/${agent.user.avatar}` :
                                        `https://ui-avatars.com/api/?name=${agent.user.name}&size=64`
                                    }
                                    alt={agent.user.name}
                                    className="h-16 w-16 rounded-full border-2 border-white shadow"
                                />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-indigo-600">
                                        Your Agent
                                    </div>
                                    <div className="text-lg font-bold text-neutral-900">
                                        {agent.user.name}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-neutral-600">
                                        Rate
                                    </div>
                                    <div className="text-lg font-bold text-indigo-600">
                                        {agent.hourly_rate} MAD/hr
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-8">
                        {/* Step 1: Service Selection */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                                        Select a Service
                                    </h2>
                                    <p className="text-neutral-600">
                                        Choose the type of cleaning service you
                                        need.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {services.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() =>
                                                setData(
                                                    'service_id',
                                                    s.id.toString(),
                                                )
                                            }
                                            className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
                                                data.service_id ===
                                                s.id.toString()
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-neutral-200 hover:border-neutral-300'
                                            }`}
                                        >
                                            <div className="mb-2 flex items-start justify-between">
                                                <h3 className="text-lg font-bold text-neutral-900">
                                                    {s.name}
                                                </h3>
                                                <div className="text-right">
                                                    <div className="text-sm text-neutral-600">
                                                        From
                                                    </div>
                                                    <div className="font-bold text-indigo-600">
                                                        {s.base_price} MAD/hr
                                                    </div>
                                                </div>
                                            </div>
                                            {s.description && (
                                                <p className="text-sm text-neutral-600">
                                                    {s.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {errors.service_id && (
                                    <p className="flex items-center gap-1 text-sm text-red-500">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.service_id}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Step 2: Date & Time */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                                        When do you need service?
                                    </h2>
                                    <p className="text-neutral-600">
                                        Select your preferred date and time.
                                    </p>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-neutral-700">
                                            <Calendar className="mr-1 inline h-4 w-4" />
                                            Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={data.scheduled_at}
                                            onChange={(e) =>
                                                setData(
                                                    'scheduled_at',
                                                    e.target.value,
                                                )
                                            }
                                            min={new Date()
                                                .toISOString()
                                                .slice(0, 16)}
                                            className="w-full rounded-xl border-neutral-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        {errors.scheduled_at && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.scheduled_at}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-neutral-700">
                                            <Clock className="mr-1 inline h-4 w-4" />
                                            Duration
                                        </label>
                                        <select
                                            value={data.duration_minutes}
                                            onChange={(e) =>
                                                setData(
                                                    'duration_minutes',
                                                    parseInt(e.target.value),
                                                )
                                            }
                                            className="w-full rounded-xl border-neutral-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="60">1 Hour</option>
                                            <option value="90">
                                                1.5 Hours
                                            </option>
                                            <option value="120">2 Hours</option>
                                            <option value="180">3 Hours</option>
                                            <option value="240">4 Hours</option>
                                            <option value="300">5 Hours</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Address */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                                        Where should we clean?
                                    </h2>
                                    <p className="text-neutral-600">
                                        Select the address for the service.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {user_addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            onClick={() =>
                                                setData(
                                                    'address_id',
                                                    addr.id.toString(),
                                                )
                                            }
                                            className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
                                                data.address_id ===
                                                addr.id.toString()
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-neutral-200 hover:border-neutral-300'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <MapPin className="mt-0.5 h-5 w-5 text-neutral-600" />
                                                <div className="flex-1">
                                                    {addr.label && (
                                                        <div className="mb-1 text-sm font-medium text-indigo-600">
                                                            {addr.label}
                                                        </div>
                                                    )}
                                                    <div className="font-medium text-neutral-900">
                                                        {addr.street_address}
                                                    </div>
                                                    <div className="text-sm text-neutral-600">
                                                        {addr.city}
                                                        {addr.postal_code &&
                                                            `, ${addr.postal_code}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {user_addresses.length === 0 && (
                                    <div className="py-8 text-center text-neutral-500">
                                        <MapPin className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                                        <p>No addresses saved yet.</p>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="w-full rounded-xl border-2 border-dashed border-neutral-300 py-3 font-medium text-neutral-600 transition-colors hover:border-indigo-600 hover:text-indigo-600"
                                >
                                    + Add New Address
                                </button>
                                {errors.address_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.address_id}
                                    </p>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        Special Instructions (Optional)
                                    </label>
                                    <textarea
                                        value={data.special_instructions}
                                        onChange={(e) =>
                                            setData(
                                                'special_instructions',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                        className="w-full rounded-xl border-neutral-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Gate code, parking info, specific areas to focus on..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                                        Review Your Booking
                                    </h2>
                                    <p className="text-neutral-600">
                                        Please review the details before
                                        proceeding to payment.
                                    </p>
                                </div>

                                <div className="space-y-4 rounded-xl bg-neutral-50 p-6">
                                    <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
                                        <div>
                                            <div className="text-sm text-neutral-600">
                                                Service
                                            </div>
                                            <div className="font-bold text-neutral-900">
                                                {selectedService?.name}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-neutral-600">
                                                Rate
                                            </div>
                                            <div className="font-bold text-neutral-900">
                                                {selectedService?.base_price}{' '}
                                                MAD/hr
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
                                        <Calendar className="h-5 w-5 text-neutral-600" />
                                        <div>
                                            <div className="text-sm text-neutral-600">
                                                Date & Time
                                            </div>
                                            <div className="font-medium text-neutral-900">
                                                {new Date(
                                                    data.scheduled_at,
                                                ).toLocaleString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
                                        <Clock className="h-5 w-5 text-neutral-600" />
                                        <div>
                                            <div className="text-sm text-neutral-600">
                                                Duration
                                            </div>
                                            <div className="font-medium text-neutral-900">
                                                {data.duration_minutes / 60}{' '}
                                                hours
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 h-5 w-5 text-neutral-600" />
                                        <div>
                                            <div className="text-sm text-neutral-600">
                                                Address
                                            </div>
                                            <div className="font-medium text-neutral-900">
                                                {
                                                    selectedAddress?.street_address
                                                }
                                            </div>
                                            <div className="text-sm text-neutral-600">
                                                {selectedAddress?.city}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-indigo-50 p-6">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-neutral-600">
                                            Subtotal
                                        </span>
                                        <span className="font-medium text-neutral-900">
                                            {estimatedPrice.toFixed(2)} MAD
                                        </span>
                                    </div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-neutral-600">
                                            Platform Fee (10%)
                                        </span>
                                        <span className="font-medium text-neutral-900">
                                            {(estimatedPrice * 0.1).toFixed(2)}{' '}
                                            MAD
                                        </span>
                                    </div>
                                    <div className="mt-2 border-t border-indigo-200 pt-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-neutral-900">
                                                Total
                                            </span>
                                            <span className="text-2xl font-bold text-indigo-600">
                                                {totalPrice.toFixed(2)} MAD
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Payment */}
                        {step === 5 && (
                            <div className="space-y-6">
                                {paymentSuccess ? (
                                    <div className="py-12 text-center">
                                        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                                        <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                                            Payment Successful!
                                        </h2>
                                        <p className="text-neutral-600">
                                            Redirecting to your booking...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                                                Complete Payment
                                            </h2>
                                            <p className="text-neutral-600">
                                                Enter your payment details to
                                                confirm your booking.
                                            </p>
                                        </div>

                                        {bookingId && (
                                            <StripePayment
                                                bookingId={bookingId}
                                                amount={totalPrice}
                                                onSuccess={handlePaymentSuccess}
                                                onError={handlePaymentError}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    {!paymentSuccess && (
                        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-8 py-6">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={step === 1 || step === 5}
                                className="flex items-center gap-2 rounded-xl border border-neutral-300 px-6 py-3 font-medium text-neutral-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                Back
                            </button>

                            {step < 4 && (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!canProceed()}
                                    className="flex items-center gap-2 rounded-xl bg-neutral-900 px-8 py-3 font-medium text-white shadow-lg transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Continue
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            )}

                            {step === 4 && (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={processing}
                                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white shadow-lg transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                    Proceed to Payment
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
