import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, Calendar, Clock, MapPin, FileText, CreditCard, User, XCircle, CheckCircle, ClipboardList } from 'lucide-react';

interface Property {
    id: number;
    name: string | null;
    type_label: string;
    city: string;
    address_line1: string;
    postal_code: string;
    surface_area: number;
}

interface Quote {
    id: number;
    quote_number: string;
    final_price: number;
    estimated_price: number;
    estimated_hours: number | null;
    price_adjustment_reason: string | null;
    commission_amount: number;
    status: string;
    status_label: string;
    expires_at: string | null;
}

interface Agent {
    id: number;
    name: string;
}

interface MissionPhoto {
    id: number;
    type: string;
    path: string;
}

interface Mission {
    id: number;
    mission_number: string;
    status: string;
    status_label: string;
    scheduled_at: string;
    agent: Agent | null;
    photos: MissionPhoto[];
}

interface ChecklistSection {
    id: string;
    title: string;
    emoji?: string;
    items: Array<{ id: string; label: string }>;
}

interface ServiceRequest {
    id: number;
    request_number: string;
    scheduled_date: string;
    scheduled_time: string;
    requested_hours: number;
    special_instructions: string | null;
    checklist: ChecklistSection[] | null;
    status: string;
    status_label: string;
    property: Property;
    quote: Quote | null;
    mission: Mission | null;
    created_at: string;
}

interface Props {
    serviceRequest: ServiceRequest;
    canCancel: boolean;
    canPay: boolean;
}

export default function Show({ serviceRequest, canCancel, canPay }: Props) {
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            quote_sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            quote_accepted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
            paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            in_progress: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
            sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            refused: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    const handleCancel = () => {
        if (confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
            router.post(route('client.requests.cancel', serviceRequest.id));
        }
    };

    const handleAcceptQuote = () => {
        if (serviceRequest.quote) {
            router.post(route('client.quotes.accept', serviceRequest.quote.id));
        }
    };

    const handleRefuseQuote = () => {
        if (serviceRequest.quote && confirm('Êtes-vous sûr de vouloir refuser ce devis ?')) {
            router.post(route('client.quotes.refuse', serviceRequest.quote.id));
        }
    };

    const steps = [
        { key: 'pending', label: 'Demande envoyée', done: true },
        { key: 'quote_sent', label: 'Devis reçu', done: ['quote_sent', 'quote_accepted', 'paid', 'assigned', 'in_progress', 'completed'].includes(serviceRequest.status) },
        { key: 'paid', label: 'Paiement', done: ['paid', 'assigned', 'in_progress', 'completed'].includes(serviceRequest.status) },
        { key: 'assigned', label: 'Intervenant assigné', done: ['assigned', 'in_progress', 'completed'].includes(serviceRequest.status) },
        { key: 'completed', label: 'Terminé', done: serviceRequest.status === 'completed' },
    ];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Mes demandes', href: route('client.requests.index') },
            { title: serviceRequest.request_number, href: '#' },
        ]}>
            <Head title={`Demande ${serviceRequest.request_number}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={route('client.requests.index')} className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour aux demandes
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {serviceRequest.request_number}
                                    </h1>
                                    <Badge className={getStatusColor(serviceRequest.status)}>
                                        {serviceRequest.status_label}
                                    </Badge>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Créée le {new Date(serviceRequest.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            {canCancel && (
                                <Button variant="outline" onClick={handleCancel} className="text-red-600 hover:text-red-700">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Annuler
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Progress Steps */}
                    {serviceRequest.status !== 'cancelled' && serviceRequest.status !== 'quote_refused' && (
                        <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    {steps.map((step, index) => (
                                        <div key={step.key} className="flex items-center flex-1">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    step.done ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300'
                                                }`}>
                                                    {step.done ? <CheckCircle className="h-5 w-5" /> : index + 1}
                                                </div>
                                                <span className="text-xs mt-2 text-center hidden sm:block">{step.label}</span>
                                            </div>
                                            {index < steps.length - 1 && (
                                                <div className={`flex-1 h-1 mx-2 ${
                                                    steps[index + 1].done ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-600'
                                                }`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quote Card */}
                            {serviceRequest.quote && (
                                <Card className={serviceRequest.quote.status === 'sent' ? 'border-sky-300 bg-sky-50/50 dark:bg-sky-900/20 dark:border-sky-700' : 'dark:bg-slate-800 dark:border-slate-700'}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-sky-500" />
                                                Devis {serviceRequest.quote.quote_number}
                                            </CardTitle>
                                            <Badge className={getStatusColor(serviceRequest.quote.status)}>
                                                {serviceRequest.quote.status_label}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">Surface</span>
                                                <span className="font-medium dark:text-white">{serviceRequest.property.surface_area} m²</span>
                                            </div>
                                            {serviceRequest.quote.estimated_hours && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-600 dark:text-slate-400">Durée estimée</span>
                                                    <span className="font-medium dark:text-white">{serviceRequest.quote.estimated_hours} heure(s)</span>
                                                </div>
                                            )}
                                        </div>

                                        {serviceRequest.quote.price_adjustment_reason && (
                                            <div className="mb-4 p-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
                                                <p className="text-sm font-medium text-sky-900 dark:text-sky-100 mb-1">💬 Détails de la prestation</p>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{serviceRequest.quote.price_adjustment_reason}</p>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <span className="text-slate-600 dark:text-slate-400 font-medium">Montant total</span>
                                            <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                                                {serviceRequest.quote.final_price} €
                                            </span>
                                        </div>
                                        
                                        {serviceRequest.quote.expires_at && serviceRequest.quote.status === 'sent' && (
                                            <p className="text-sm text-orange-600 mb-4">
                                                ⏰ Expire le {new Date(serviceRequest.quote.expires_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        )}

                                        {serviceRequest.quote.status === 'sent' && (
                                            <div className="flex gap-3">
                                                <Button 
                                                    onClick={handleAcceptQuote}
                                                    className="flex-1 bg-sky-500 hover:bg-sky-600"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Accepter et payer
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    onClick={handleRefuseQuote}
                                                    className="text-red-600"
                                                >
                                                    Refuser
                                                </Button>
                                            </div>
                                        )}

                                        {serviceRequest.quote.status === 'accepted' && !serviceRequest.mission && (
                                            <Link href={route('client.payment.show', serviceRequest.quote.id)}>
                                                <Button className="w-full bg-green-500 hover:bg-green-600">
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    Procéder au paiement
                                                </Button>
                                            </Link>
                                        )}

                                        {(serviceRequest.quote.status === 'paid' || serviceRequest.mission) && (
                                            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                <span className="font-medium text-green-700 dark:text-green-300">Paiement effectué</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Mission Card */}
                            {serviceRequest.mission && (
                                <Card className="dark:bg-slate-800 dark:border-slate-700">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="h-5 w-5 text-sky-500" />
                                                Intervention {serviceRequest.mission.mission_number}
                                            </CardTitle>
                                            <Badge className={getStatusColor(serviceRequest.mission.status)}>
                                                {serviceRequest.mission.status_label}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {serviceRequest.mission.agent && (
                                            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                                                    <User className="h-5 w-5 text-sky-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium dark:text-white">{serviceRequest.mission.agent.name}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Intervenant</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <Link href={route('client.missions.show', serviceRequest.mission.id)}>
                                            <Button variant="outline" className="w-full">
                                                Voir les détails de l'intervention
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Waiting for Quote */}
                            {serviceRequest.status === 'pending' && (
                                <Card className="bg-yellow-50 border-yellow-200">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Clock className="h-6 w-6 text-yellow-600" />
                                        </div>
                                        <h3 className="font-semibold text-yellow-800 mb-2">En attente de devis</h3>
                                        <p className="text-sm text-yellow-700">
                                            Notre équipe prépare votre devis personnalisé. Vous le recevrez sous 24h.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Property Info */}
                            <Card className="dark:bg-slate-800 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base dark:text-white">
                                        <Home className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                        Bien
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium dark:text-white">{serviceRequest.property.name || serviceRequest.property.type_label}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        {serviceRequest.property.address_line1}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {serviceRequest.property.postal_code} {serviceRequest.property.city}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        {serviceRequest.property.surface_area} m²
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Schedule */}
                            <Card className="dark:bg-slate-800 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base dark:text-white">
                                        <Calendar className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                        Planification
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Date</span>
                                        <span className="font-medium dark:text-white">
                                            {new Date(serviceRequest.scheduled_date).toLocaleDateString('fr-FR', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Heure</span>
                                        <span className="font-medium dark:text-white">{serviceRequest.scheduled_time}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Special Instructions */}
                            {serviceRequest.special_instructions && (
                                <Card className="dark:bg-slate-800 dark:border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="text-base dark:text-white">Instructions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                            {serviceRequest.special_instructions}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Selected intervention axes */}
                            {serviceRequest.checklist && serviceRequest.checklist.length > 0 && (
                                <Card className="dark:bg-slate-800 dark:border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base dark:text-white">
                                            <ClipboardList className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                            Axes d&apos;intervention
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {serviceRequest.checklist.map((section) => (
                                            <div key={section.id}>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {section.emoji ? `${section.emoji} ` : ''}
                                                    {section.title}
                                                </p>
                                                <ul className="mt-1 space-y-0.5">
                                                    {section.items.map((item) => (
                                                        <li
                                                            key={item.id}
                                                            className="text-xs text-slate-500 dark:text-slate-400 pl-1"
                                                        >
                                                            • {item.label}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
