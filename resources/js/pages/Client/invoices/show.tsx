import { Head, Link } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Download, 
    FileText,
    Building2,
    User,
    Calendar,
    Receipt
} from 'lucide-react';

interface LineItem {
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total: number;
}

interface Invoice {
    id: number;
    invoice_number: string;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    status: string;
    payment_method: string | null;
    billing_name: string | null;
    billing_address: string | null;
    billing_email: string | null;
    description: string | null;
    line_items: LineItem[] | null;
    issued_at: string;
    paid_at: string | null;
    mission?: {
        id: number;
        mission_number: string;
        scheduled_at: string;
        property?: {
            name: string | null;
            type: string;
            address_line1: string;
            postal_code: string;
            city: string;
        };
    };
    user?: {
        name: string;
        email: string;
    };
}

interface Props {
    invoice: Invoice;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    paid: { label: 'Payée', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    refunded: { label: 'Remboursée', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function InvoiceShow({ invoice }: Props) {
    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Mes factures', href: route('client.invoices.index') },
        { title: invoice.invoice_number, href: route('client.invoices.show', invoice.id) },
    ];

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

    const status = statusConfig[invoice.status] || statusConfig.pending;

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Facture ${invoice.invoice_number}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={route('client.invoices.index')}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Facture {invoice.invoice_number}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className={status.color}>{status.label}</Badge>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Émise le {formatDate(invoice.issued_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button asChild>
                            <a href={route('client.invoices.download', invoice.id)}>
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger PDF
                            </a>
                        </Button>
                    </div>

                    {/* Invoice Content */}
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardContent className="p-8">
                            {/* Header Section */}
                            <div className="flex justify-between items-start mb-8 pb-8 border-b dark:border-slate-700">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="bg-sky-600 text-white rounded-lg p-2">
                                            <Receipt className="h-6 w-6" />
                                        </div>
                                        <span className="text-2xl font-bold text-sky-600">VIMAIZ</span>
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        <p>VIMAIZ SAS</p>
                                        <p>123 Avenue des Champs-Élysées</p>
                                        <p>75008 Paris, France</p>
                                        <p className="mt-2">SIRET: 123 456 789 00012</p>
                                        <p>TVA: FR12345678901</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                        FACTURE
                                    </h2>
                                    <p className="text-lg font-mono text-slate-600 dark:text-slate-400">
                                        {invoice.invoice_number}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        Date: {formatDate(invoice.issued_at)}
                                    </p>
                                    {invoice.paid_at && (
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            Payée le {formatDate(invoice.paid_at)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">
                                    Facturé à
                                </h3>
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {invoice.billing_name || invoice.user?.name}
                                        </p>
                                        {invoice.billing_address && (
                                            <p className="text-slate-600 dark:text-slate-400">
                                                {invoice.billing_address}
                                            </p>
                                        )}
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {invoice.billing_email || invoice.user?.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="mb-8">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b dark:border-slate-700">
                                            <th className="text-left py-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                Description
                                            </th>
                                            <th className="text-center py-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                Qté
                                            </th>
                                            <th className="text-right py-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                Prix unit.
                                            </th>
                                            <th className="text-right py-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.line_items?.map((item, index) => (
                                            <tr key={index} className="border-b dark:border-slate-700/50">
                                                <td className="py-4 text-slate-900 dark:text-white">
                                                    {item.description}
                                                </td>
                                                <td className="py-4 text-center text-slate-600 dark:text-slate-400">
                                                    {item.quantity} {item.unit}
                                                </td>
                                                <td className="py-4 text-right text-slate-600 dark:text-slate-400">
                                                    {formatCurrency(item.unit_price)}
                                                </td>
                                                <td className="py-4 text-right font-medium text-slate-900 dark:text-white">
                                                    {formatCurrency(item.total)}
                                                </td>
                                            </tr>
                                        )) || (
                                            <tr className="border-b dark:border-slate-700/50">
                                                <td className="py-4 text-slate-900 dark:text-white">
                                                    {invoice.description || 'Prestation de ménage'}
                                                </td>
                                                <td className="py-4 text-center text-slate-600 dark:text-slate-400">
                                                    1
                                                </td>
                                                <td className="py-4 text-right text-slate-600 dark:text-slate-400">
                                                    {formatCurrency(invoice.subtotal)}
                                                </td>
                                                <td className="py-4 text-right font-medium text-slate-900 dark:text-white">
                                                    {formatCurrency(invoice.subtotal)}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-64">
                                    <div className="flex justify-between py-2">
                                        <span className="text-slate-600 dark:text-slate-400">Sous-total HT</span>
                                        <span className="text-slate-900 dark:text-white">{formatCurrency(invoice.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-slate-600 dark:text-slate-400">TVA ({invoice.tax_rate}%)</span>
                                        <span className="text-slate-900 dark:text-white">{formatCurrency(invoice.tax_amount)}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-t dark:border-slate-700 mt-2">
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">Total TTC</span>
                                        <span className="text-lg font-bold text-sky-600">{formatCurrency(invoice.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-12 pt-8 border-t dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
                                <p>Merci de votre confiance !</p>
                                <p className="mt-2">
                                    Pour toute question concernant cette facture, contactez-nous à{' '}
                                    <a href="mailto:facturation@vimaiz.fr" className="text-sky-600 hover:underline">
                                        facturation@vimaiz.fr
                                    </a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
