import { Head, Link } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    Download, 
    Eye, 
    Receipt, 
    TrendingUp,
    Calendar,
    Euro
} from 'lucide-react';

interface Invoice {
    id: number;
    invoice_number: string;
    total: number;
    status: string;
    description: string | null;
    issued_at: string;
    paid_at: string | null;
    mission?: {
        id: number;
        mission_number: string;
        property?: {
            name: string | null;
            type: string;
        };
    };
}

interface PaginatedInvoices {
    data: Invoice[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Stats {
    total_invoices: number;
    total_paid: number;
    current_year: number;
}

interface Props {
    invoices: PaginatedInvoices;
    stats: Stats;
}

const breadcrumbs = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Mes factures', href: route('client.invoices.index') },
];

const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    paid: { label: 'Payée', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    refunded: { label: 'Remboursée', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function InvoicesIndex({ invoices, stats }: Props) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Mes factures" />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Mes factures
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Consultez et téléchargez vos factures
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 sm:grid-cols-3 mb-8">
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Total factures</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                            {stats.total_invoices}
                                        </p>
                                    </div>
                                    <div className="bg-sky-100 dark:bg-sky-900/30 rounded-full p-3">
                                        <Receipt className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Total payé</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                            {formatCurrency(stats.total_paid)}
                                        </p>
                                    </div>
                                    <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-3">
                                        <Euro className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Cette année</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                            {formatCurrency(stats.current_year)}
                                        </p>
                                    </div>
                                    <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-3">
                                        <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Invoices List */}
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="dark:text-white">Historique des factures</CardTitle>
                            <CardDescription className="dark:text-slate-400">
                                {invoices.total} facture{invoices.total > 1 ? 's' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {invoices.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                                    <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                                        Aucune facture
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Vos factures apparaîtront ici après vos premières réservations.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {invoices.data.map((invoice) => {
                                        const status = statusConfig[invoice.status] || statusConfig.pending;

                                        return (
                                            <div
                                                key={invoice.id}
                                                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-sky-100 dark:bg-sky-900/30 rounded-full p-3">
                                                        <FileText className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-white">
                                                            {invoice.invoice_number}
                                                        </p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            {invoice.description || invoice.mission?.mission_number}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Calendar className="h-3 w-3 text-slate-400" />
                                                            <span className="text-xs text-slate-400">
                                                                {formatDate(invoice.issued_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="font-bold text-slate-900 dark:text-white">
                                                            {formatCurrency(invoice.total)}
                                                        </p>
                                                        <Badge className={status.color}>
                                                            {status.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                        >
                                                            <Link href={route('client.invoices.show', invoice.id)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                        >
                                                            <a href={route('client.invoices.download', invoice.id)}>
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
