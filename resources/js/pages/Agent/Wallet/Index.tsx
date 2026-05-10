import { Head, useForm } from '@inertiajs/react';
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
    XCircle,
    CreditCard,
    Banknote
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

interface Props {
    wallet: WalletData;
    transactions: PaginatedTransactions;
}

const breadcrumbs = [
    { title: 'Dashboard', href: route('agent.dashboard') },
    { title: 'Mon portefeuille', href: route('agent.wallet.index') },
];

export default function WalletIndex({ wallet, transactions }: Props) {
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        bank_account: '',
    });

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('agent.wallet.withdraw'), {
            onSuccess: () => {
                setWithdrawDialogOpen(false);
                reset();
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
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Mon portefeuille
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Gérez vos gains et retraits
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        {/* Balance */}
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

                        {/* Pending */}
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

                        {/* Total Earned */}
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

                        {/* Total Withdrawn */}
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

                    {/* Actions */}
                    <div className="flex gap-4 mb-8">
                        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    className="bg-sky-600 hover:bg-sky-700"
                                    disabled={wallet.balance < 1}
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
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Montant (€)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                min="1"
                                                max={wallet.balance}
                                                step="0.01"
                                                placeholder="1.00"
                                                value={data.amount}
                                                onChange={(e) => setData('amount', e.target.value)}
                                            />
                                            {errors.amount && (
                                                <p className="text-sm text-red-500">{errors.amount}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bank_account">IBAN</Label>
                                            <Input
                                                id="bank_account"
                                                type="text"
                                                placeholder="FR76 1234 5678 9012 3456 7890 123"
                                                value={data.bank_account}
                                                onChange={(e) => setData('bank_account', e.target.value)}
                                            />
                                            {errors.bank_account && (
                                                <p className="text-sm text-red-500">{errors.bank_account}</p>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                                            Annuler
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Envoi...' : 'Confirmer le retrait'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {wallet.balance < 100 && (
                            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
                                <Clock className="mr-1 h-4 w-4" />
                                Minimum 100 € pour un retrait
                            </p>
                        )}
                    </div>

                    {/* Transactions */}
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
                                        Vos transactions apparaîtront ici après vos premières missions.
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
