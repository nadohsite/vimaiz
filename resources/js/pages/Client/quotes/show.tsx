import { Head, Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    FileText, 
    Home, 
    Calendar, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    CreditCard,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';
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
    special_instructions: string | null;
    property: Property;
}

interface Quote {
    id: number;
    quote_number: string;
    estimated_price: number;
    final_price: number | null;
    estimated_hours: number | null;
    commission_rate: number;
    admin_notes: string | null;
    price_adjustment_reason: string | null;
    status: string;
    status_label: string;
    sent_at: string | null;
    expires_at: string | null;
    service_request: ServiceRequest;
}

interface Props {
    quote: Quote;
}

const breadcrumbs = [
    { title: 'Mes demandes', href: route('client.requests.index') },
    { title: 'Devis', href: '#' },
];

export default function QuoteShow({ quote }: Props) {
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRefusing, setIsRefusing] = useState(false);

    const serviceRequest = quote.service_request;
    const property = serviceRequest.property;
    const price = quote.final_price ?? quote.estimated_price;

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = () => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
            draft: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300', icon: <FileText className="h-3 w-3" /> },
            sent: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <AlertCircle className="h-3 w-3" /> },
            accepted: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="h-3 w-3" /> },
            refused: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
            expired: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="h-3 w-3" /> },
        };

        const config = statusConfig[quote.status] || statusConfig.draft;

        return (
            <Badge className={`${config.color} gap-1`}>
                {config.icon}
                {quote.status_label}
            </Badge>
        );
    };

    const handleAccept = () => {
        setIsAccepting(true);
        router.post(route('client.quotes.accept', quote.id), {}, {
            onFinish: () => setIsAccepting(false),
        });
    };

    const handleRefuse = () => {
        if (confirm('Êtes-vous sûr de vouloir refuser ce devis ?')) {
            setIsRefusing(true);
            router.post(route('client.quotes.refuse', quote.id), {}, {
                onFinish: () => setIsRefusing(false),
            });
        }
    };

    const canRespond = quote.status === 'sent';
    const isExpired = quote.expires_at && new Date(quote.expires_at) < new Date() && quote.status === 'sent';

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Devis ${quote.quote_number}`} />

            <div className="mx-auto max-w-4xl px-4 py-8">
                <Link
                    href={route('client.requests.show', serviceRequest.id)}
                    className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la demande
                </Link>

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Devis
                            </h1>
                            {getStatusBadge()}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-mono">
                            {quote.quote_number}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quote Details */}
                        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                                    <FileText className="h-5 w-5 text-sky-500" />
                                    Détails du devis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Property */}
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                    <div className="rounded-lg bg-sky-100 dark:bg-sky-900/30 p-3">
                                        <Home className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {property.name || property.type_label}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {property.address_line1}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {property.postal_code} {property.city}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Surface : {property.surface_area} m²
                                        </p>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                        <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-2">
                                            <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {formatAppointmentDate(serviceRequest.scheduled_date, {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                        <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Horaire</p>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {formatRequestTime(serviceRequest.scheduled_time)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Estimated Hours */}
                                {quote.estimated_hours && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800">
                                        <div className="rounded-lg bg-sky-100 dark:bg-sky-900/30 p-2">
                                            <Clock className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Durée estimée</p>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {quote.estimated_hours} heure(s)
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Special Instructions */}
                                {serviceRequest.special_instructions && (
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Instructions spéciales
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {serviceRequest.special_instructions}
                                        </p>
                                    </div>
                                )}

                                {/* Admin Note */}
                                {quote.price_adjustment_reason && (
                                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                                            Note de VIMAIZ
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            {quote.price_adjustment_reason}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions for sent quotes */}
                        {canRespond && !isExpired && (
                            <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-3">
                                            <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                                                Votre devis est prêt !
                                            </h3>
                                            <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-4">
                                                Acceptez ce devis pour procéder au paiement et confirmer votre réservation.
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                <Button
                                                    onClick={handleAccept}
                                                    disabled={isAccepting || isRefusing}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                >
                                                    {isAccepting ? (
                                                        'Acceptation...'
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Accepter et payer
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={handleRefuse}
                                                    disabled={isAccepting || isRefusing}
                                                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                                >
                                                    {isRefusing ? (
                                                        'Refus...'
                                                    ) : (
                                                        <>
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Refuser
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Expired notice */}
                        {isExpired && (
                            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                        <div>
                                            <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                                                Ce devis a expiré
                                            </h3>
                                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                                Veuillez créer une nouvelle demande pour obtenir un nouveau devis.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Accepted - Go to payment */}
                        {quote.status === 'accepted' && (
                            <Card className="border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-full bg-sky-100 dark:bg-sky-900/50 p-3">
                                            <CreditCard className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sky-800 dark:text-sky-300 mb-1">
                                                Devis accepté !
                                            </h3>
                                            <p className="text-sm text-sky-700 dark:text-sky-400 mb-4">
                                                Procédez au paiement pour confirmer votre réservation.
                                            </p>
                                            <Button asChild className="bg-sky-600 hover:bg-sky-700 text-white">
                                                <Link href={route('client.payment.show', quote.id)}>
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Procéder au paiement
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Price Summary */}
                    <div className="lg:col-span-1">
                        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-4">
                            <CardHeader>
                                <CardTitle className="text-slate-900 dark:text-white">
                                    Montant
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {quote.final_price && quote.final_price !== quote.estimated_price && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">
                                            Estimation initiale
                                        </span>
                                        <span className="text-slate-400 line-through">
                                            {quote.estimated_price.toFixed(2)} €
                                        </span>
                                    </div>
                                )}

                                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">
                                        Total TTC
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                                        {price.toFixed(2)} €
                                    </p>
                                </div>

                                {quote.sent_at && (
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        Devis envoyé le {formatDateTime(quote.sent_at)}
                                    </div>
                                )}

                                {quote.expires_at && quote.status === 'sent' && (
                                    <div className="text-xs text-amber-600 dark:text-amber-400">
                                        Expire le {formatDateTime(quote.expires_at)}
                                    </div>
                                )}

                                <hr className="border-slate-200 dark:border-slate-700" />

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        <span>Paiement sécurisé</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        <span>Intervenant vérifié VIMAIZ</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
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
