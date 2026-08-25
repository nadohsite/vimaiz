import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Wallet,
    TrendingUp,
    ArrowDownCircle,
    ArrowUpCircle,
    Clock,
    CheckCircle,
    Banknote,
    CreditCard,
    AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface WalletData {
    id: number;
    balance: number;
    pending_balance: number;
    total_earned: number;
    total_withdrawn: number;
}

interface Transaction {
    id: number;
    type: 'credit' | 'debit' | 'withdrawal';
    amount: number;
    balance_after: number;
    description: string | null;
    status: string;
    reference: string | null;
    created_at: string;
    booking?: {
        id: number;
    };
}

interface PaginatedTransactions {
    data: Transaction[];
    current_page: number;
    last_page: number;
    total: number;
}

interface BankDetails {
    iban: string | null;
    bic: string | null;
    bank_account_holder: string | null;
    is_complete: boolean;
}

interface Props {
    wallet: WalletData;
    transactions: PaginatedTransactions;
    bankDetails: BankDetails;
}

const breadcrumbs = [
    { title: 'Dashboard', href: route('agent.dashboard') },
    { title: 'Mon portefeuille', href: route('agent.wallet.index') },
];

function formatIbanInput(value: string): string {
    const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 34);

    return clean.replace(/(.{4})/g, '$1 ').trim();
}

export default function WalletIndex({ wallet, transactions, bankDetails }: Props) {
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash;

    const bankForm = useForm({
        bank_account_holder: bankDetails.bank_account_holder ?? '',
        iban: bankDetails.iban ?? '',
        bic: bankDetails.bic ?? '',
    });

    const withdrawForm = useForm({
        amount: '',
    });

    const canWithdraw = bankDetails.is_complete && Number(wallet.balance) >= 1;

    const handleSaveBankDetails = (e: React.FormEvent) => {
        e.preventDefault();
        bankForm.put(route('agent.wallet.bank-details'), {
            preserveScroll: true,
        });
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        withdrawForm.post(route('agent.wallet.withdraw'), {
            onSuccess: () => {
                setWithdrawDialogOpen(false);
                withdrawForm.reset();
            },
        });
    };

    const getTransactionIcon = (type: string, status: string) => {
        if (status === 'pending') {
            return { icon: Clock, color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' };
        }
        if (type === 'credit') {
            return { icon: ArrowDownCircle, color: 'text-green-500 bg-green-100 dark:bg-green-900/30' };
        }
        if (type === 'withdrawal') {
            return { icon: Banknote, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' };
        }
        return { icon: ArrowUpCircle, color: 'text-red-500 bg-red-100 dark:bg-red-900/30' };
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; color: string }> = {
            completed: { label: 'Complété', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
            pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
            failed: { label: 'Échoué', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
            rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
        };
        const { label, color } = config[status] || config.pending;
        return <Badge className={color}>{label}</Badge>;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mon portefeuille" />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Mon portefeuille
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Gérez vos gains et retraits
                        </p>
                    </div>

                    {flash?.success && (
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <p className="text-green-800 dark:text-green-300">{flash.success}</p>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <p className="text-red-800 dark:text-red-300">{flash.error}</p>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <Card className="bg-gradient-to-br from-sky-500 to-blue-600 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sky-100 text-sm font-medium">Solde disponible</p>
                                        <p className="text-3xl font-bold mt-1">
                                            {Number(wallet.balance).toFixed(2)} €
                                        </p>
                                    </div>
                                    <div className="bg-white/20 rounded-full p-3">
                                        <Wallet className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">En attente</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                            {Number(wallet.pending_balance).toFixed(2)} €
                                        </p>
                                    </div>
                                    <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-3">
                                        <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total gagné</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                            {Number(wallet.total_earned).toFixed(2)} €
                                        </p>
                                    </div>
                                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                                        <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total retiré</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                            {Number(wallet.total_withdrawn).toFixed(2)} €
                                        </p>
                                    </div>
                                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                                        <Banknote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                <CreditCard className="h-5 w-5" />
                                Coordonnées bancaires
                            </CardTitle>
                            <CardDescription className="dark:text-slate-400">
                                Renseignez votre IBAN avant de demander un retrait. Le virement sera effectué sur ce compte.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!bankDetails.is_complete && (
                                <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                                    <p className="text-sm text-amber-800 dark:text-amber-300">
                                        Vous devez enregistrer vos coordonnées bancaires avant de pouvoir demander un retrait.
                                    </p>
                                </div>
                            )}
                            <form onSubmit={handleSaveBankDetails} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="bank_account_holder">Titulaire du compte</Label>
                                        <Input
                                            id="bank_account_holder"
                                            type="text"
                                            autoComplete="name"
                                            placeholder="Nom du titulaire"
                                            value={bankForm.data.bank_account_holder}
                                            onChange={(e) => bankForm.setData('bank_account_holder', e.target.value)}
                                        />
                                        {bankForm.errors.bank_account_holder && (
                                            <p className="text-sm text-red-500">{bankForm.errors.bank_account_holder}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="iban">IBAN</Label>
                                        <Input
                                            id="iban"
                                            type="text"
                                            autoComplete="off"
                                            placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                                            value={bankForm.data.iban}
                                            onChange={(e) => bankForm.setData('iban', formatIbanInput(e.target.value))}
                                        />
                                        {bankForm.errors.iban && (
                                            <p className="text-sm text-red-500">{bankForm.errors.iban}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bic">BIC <span className="font-normal text-slate-400">(optionnel)</span></Label>
                                        <Input
                                            id="bic"
                                            type="text"
                                            autoComplete="off"
                                            placeholder="BNPAFRPP"
                                            value={bankForm.data.bic}
                                            onChange={(e) => bankForm.setData('bic', e.target.value.toUpperCase().replace(/\s+/g, '').slice(0, 11))}
                                        />
                                        {bankForm.errors.bic && (
                                            <p className="text-sm text-red-500">{bankForm.errors.bic}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={bankForm.processing}>
                                        {bankForm.processing ? 'Enregistrement...' : 'Enregistrer les coordonnées'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-center">
                        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="bg-sky-600 hover:bg-sky-700"
                                    disabled={!canWithdraw}
                                >
                                    <Banknote className="mr-2 h-4 w-4" />
                                    Demander un retrait
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Demander un retrait</DialogTitle>
                                    <DialogDescription>
                                        Solde disponible : {Number(wallet.balance).toFixed(2)} €
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleWithdraw}>
                                    <div className="space-y-4 py-4">
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/50">
                                            <p className="text-slate-500 dark:text-slate-400">Virement vers</p>
                                            <p className="mt-1 font-medium text-slate-900 dark:text-white">
                                                {bankDetails.bank_account_holder}
                                            </p>
                                            <p className="font-mono text-slate-700 dark:text-slate-300">
                                                {bankDetails.iban}
                                            </p>
                                            {bankDetails.bic && (
                                                <p className="text-slate-500 dark:text-slate-400">BIC {bankDetails.bic}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Montant (€)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                min="1"
                                                max={wallet.balance}
                                                step="0.01"
                                                placeholder="1.00"
                                                value={withdrawForm.data.amount}
                                                onChange={(e) => withdrawForm.setData('amount', e.target.value)}
                                            />
                                            {withdrawForm.errors.amount && (
                                                <p className="text-sm text-red-500">{withdrawForm.errors.amount}</p>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                                            Annuler
                                        </Button>
                                        <Button type="submit" disabled={withdrawForm.processing}>
                                            {withdrawForm.processing ? 'Envoi...' : 'Confirmer le retrait'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        {!bankDetails.is_complete && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Enregistrez votre IBAN pour activer les retraits.
                            </p>
                        )}
                        {bankDetails.is_complete && Number(wallet.balance) < 1 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Solde insuffisant pour un retrait (minimum 1 €).
                            </p>
                        )}
                    </div>

                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="dark:text-white">Historique des transactions</CardTitle>
                            <CardDescription className="dark:text-slate-400">
                                {transactions.total} transaction{transactions.total > 1 ? 's' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transactions.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <Wallet className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                                    <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                                        Aucune transaction
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Vos transactions apparaîtront ici après vos premières interventions.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {transactions.data.map((transaction) => {
                                        const { icon: Icon, color } = getTransactionIcon(transaction.type, transaction.status);
                                        const isCredit = transaction.type === 'credit';

                                        return (
                                            <div
                                                key={transaction.id}
                                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50"
                                            >
                                                <div className={`shrink-0 rounded-full p-3 ${color}`}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {transaction.description || (isCredit ? 'Crédit' : 'Retrait')}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {formatDate(transaction.created_at)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold ${isCredit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {isCredit ? '+' : '-'}{Number(transaction.amount).toFixed(2)} €
                                                    </p>
                                                    {getStatusBadge(transaction.status)}
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
        </AppLayout>
    );
}
