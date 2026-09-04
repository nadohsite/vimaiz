import { Head, router } from '@inertiajs/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState, useMemo } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Shield, Home, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { formatAppointmentDate, formatRequestTime } from '@/lib/datetime';

interface Property {
    id: number;
    name: string | null;
    type_label: string;
    city: string;
    address_line1: string;
    postal_code: string;
    surface_area: number;
}

interface ServiceRequest {
    id: number;
    scheduled_date: string;
    scheduled_time: string;
    requested_hours: number;
    property: Property;
}

interface Quote {
    id: number;
    quote_number: string;
    estimated_price: number;
    final_price: number | null;
    status: string;
    service_request: ServiceRequest;
}

interface Props {
    quote: Quote;
    clientSecret: string;
    stripeKey: string;
}

const breadcrumbs = [
    { title: 'Mes demandes', href: route('client.requests.index') },
    { title: 'Paiement', href: '#' },
];

function CheckoutForm({ quote }: { quote: Quote }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        const { error: submitError, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: route('client.payment.return'),
            },
            redirect: 'if_required',
        });

        if (submitError) {
            setError(submitError.message || 'Une erreur est survenue lors du paiement.');
            setIsProcessing(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            const axios = (await import('axios')).default;

            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                const response = await axios.post(route('client.payment.process', quote.id), {
                    payment_intent_id: paymentIntent.id,
                }, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                    }
                });

                if (response.data.redirect) {
                    window.location.href = response.data.redirect;
                } else {
                    router.visit(route('client.missions.index'));
                }
            } catch (error: any) {
                setError(error.response?.data?.message || 'Une erreur est survenue lors du traitement du paiement.');
                setIsProcessing(false);
            }
        } else {
            setError('Le paiement n\'a pas pu être confirmé.');
            setIsProcessing(false);
        }
    };

    const price = Number(quote.final_price ?? quote.estimated_price);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                <PaymentElement 
                    options={{
                        layout: 'tabs',
                    }}
                />
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-700 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/30"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Traitement en cours...
                    </>
                ) : (
                    <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Payer {price.toFixed(2)} €
                    </>
                )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Shield className="h-4 w-4" />
                <span>Paiement sécurisé par Stripe</span>
            </div>
        </form>
    );
}

export default function PaymentShow({ quote, clientSecret, stripeKey }: Props) {
    const stripePromise = useMemo(() => stripeKey ? loadStripe(stripeKey) : null, [stripeKey]);
    const price = Number(quote.final_price ?? quote.estimated_price);
    const serviceRequest = quote.service_request;
    const property = serviceRequest.property;

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Paiement" />

            <div className="mx-auto max-w-4xl px-4 py-8">
                <Link
                    href={route('client.requests.show', serviceRequest.id)}
                    className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la demande
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Finaliser votre réservation
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Effectuez le paiement pour confirmer votre intervention
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-5">
                    {/* Payment Form */}
                    <div className="lg:col-span-3">
                        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                                    <CreditCard className="h-5 w-5 text-emerald-500" />
                                    Informations de paiement
                                </CardTitle>
                                <CardDescription className="dark:text-slate-400">
                                    Entrez vos coordonnées bancaires pour procéder au paiement
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!stripeKey || !stripePromise ? (
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        Le paiement est temporairement indisponible. Réessayez dans un instant.
                                    </p>
                                ) : (
                                <Elements
                                    stripe={stripePromise}
                                    options={{
                                        clientSecret,
                                        appearance: {
                                            theme: 'stripe',
                                            variables: {
                                                colorPrimary: '#10b981',
                                                borderRadius: '12px',
                                            },
                                        },
                                        locale: 'fr',
                                    }}
                                >
                                    <CheckoutForm quote={quote} />
                                </Elements>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-2">
                        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-4">
                            <CardHeader>
                                <CardTitle className="text-slate-900 dark:text-white">
                                    Récapitulatif
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Property Info */}
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-sky-100 dark:bg-sky-900/30 p-2">
                                        <Home className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {property.name || property.type_label}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {property.address_line1}, {property.postal_code} {property.city}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {property.surface_area} m²
                                        </p>
                                    </div>
                                </div>

                                {/* Date Info */}
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-2">
                                        <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {formatAppointmentDate(serviceRequest.scheduled_date, {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            à {formatRequestTime(serviceRequest.scheduled_time)}
                                        </p>
                                    </div>
                                </div>

                                <hr className="border-slate-200 dark:border-slate-700" />

                                {/* Quote Reference */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Devis</span>
                                    <Badge variant="outline" className="font-mono">
                                        {quote.quote_number}
                                    </Badge>
                                </div>

                                {/* Total */}
                                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
                                            Total à payer
                                        </span>
                                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                            {price.toFixed(2)} €
                                        </span>
                                    </div>
                                </div>

                                {/* Benefits */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        <span>Intervenant vérifié</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        <span>Intervention géolocalisée et horodatée</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        <span>Satisfaction garantie</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
