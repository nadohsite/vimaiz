import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Home, Clock, ChevronRight, FileText } from 'lucide-react';

interface Property {
    id: number;
    name: string | null;
    type_label: string;
    city: string;
}

interface Quote {
    id: number;
    final_price: number;
    status: string;
}

interface Mission {
    id: number;
    status: string;
}

interface ServiceRequest {
    id: number;
    request_number: string;
    scheduled_date: string;
    scheduled_time: string;
    requested_hours: number;
    status: string;
    status_label: string;
    property: Property;
    quote: Quote | null;
    mission: Mission | null;
    created_at: string;
}

interface Props {
    requests: {
        data: ServiceRequest[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    statuses: Record<string, string>;
}

export default function Index({ requests, statuses }: Props) {
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
            quote_sent: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
            quote_accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
            quote_refused: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
            paid: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
            assigned: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
            in_progress: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700',
            completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Mes demandes', href: route('client.requests.index') }]}>
            <Head title="Mes demandes" />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes demandes</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Suivez l'état de vos demandes d'intervention</p>
                        </div>
                        <Link href={route('client.requests.create')}>
                            <Button className="bg-sky-500 hover:bg-sky-600">
                                <Plus className="h-4 w-4 mr-2" />
                                Nouvelle demande
                            </Button>
                        </Link>
                    </div>

                    {/* Requests List */}
                    {requests.data.length > 0 ? (
                        <div className="space-y-4">
                            {requests.data.map((request) => (
                                <Link key={request.id} href={route('client.requests.show', request.id)} className="block mb-4 last:mb-0">
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2 bg-sky-50 dark:bg-sky-900/50 rounded-lg shrink-0">
                                                        <FileText className="h-6 w-6 text-sky-500" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                                {request.request_number}
                                                            </span>
                                                            <Badge className={getStatusColor(request.status)}>
                                                                {request.status_label}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <Home className="h-4 w-4" />
                                                                {request.property.name || request.property.type_label} - {request.property.city}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {new Date(request.scheduled_date).toLocaleDateString('fr-FR', {
                                                                    weekday: 'short',
                                                                    day: 'numeric',
                                                                    month: 'short'
                                                                })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-4 w-4" />
                                                                {request.requested_hours}h
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 sm:shrink-0">
                                                    {request.quote && (
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                                {request.quote.final_price} €
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">Devis</p>
                                                        </div>
                                                    )}
                                                    <ChevronRight className="h-5 w-5 text-slate-400" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}

                            {/* Pagination */}
                            {requests.last_page > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    {requests.links.map((link: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded text-sm ${
                                                link.active 
                                                    ? 'bg-sky-500 text-white' 
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <Card className="text-center py-12 dark:bg-slate-800 dark:border-slate-700">
                            <CardContent>
                                <div className="mx-auto w-16 h-16 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="h-8 w-8 text-sky-500 dark:text-sky-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    Aucune demande
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">
                                    Créez votre première demande d'intervention pour votre logement.
                                </p>
                                <Link href={route('client.requests.create')}>
                                    <Button className="bg-sky-500 hover:bg-sky-600">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nouvelle demande
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
