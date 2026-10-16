import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, ShieldCheck, Wallet } from 'lucide-react';

const benefits = [
    {
        icon: ShieldCheck,
        title: 'Clients garantis',
        description:
            "Nos budgets marketing vous apportent des clients premium toute l'année sans que vous n'ayez à investir personnellement dans le marketing.",
    },
    {
        icon: Wallet,
        title: 'Trésorerie sécurisée',
        description:
            'Nous gérons les encaissements à distance auprès des propriétaires et vous versons vos gains de manière sécurisée sous 48 heures.',
    },
];

const breadcrumbs = [
    { title: 'Dashboard', href: route('agent.dashboard') },
    { title: 'Rémunération et transparence', href: route('agent.remuneration-transparence') },
];

export default function RemunerationTransparence() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rémunération et transparence" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Rémunération et transparence
                        </h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Chez Vimaiz, nous valorisons votre expertise en vous connectant
                            exclusivement à des propriétés de standing. Pour chaque forfait fixe,
                            vous percevez 75 % du montant total de l&apos;intervention.
                        </p>
                    </div>

                    <Card className="mb-6 bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-sky-100 dark:bg-sky-900/30 rounded-full p-3">
                                    <Percent className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sky-900 dark:text-sky-100 mb-2">
                                        Répartition 75 % / 25 %
                                    </h3>
                                    <p className="text-sm text-sky-700 dark:text-sky-300 leading-relaxed">
                                        Les 25 % prélevés par la plateforme servent de réinvestissement
                                        marketing, d&apos;amélioration continue et de sécurisation des
                                        données. Ils se traduisent pour vous par des avantages concrets.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {benefits.map(({ icon: Icon, title, description }) => (
                            <Card key={title} className="dark:bg-slate-800 dark:border-slate-700">
                                <CardHeader>
                                    <div className="mb-2 flex items-center gap-3">
                                        <div className="rounded-full bg-slate-100 p-2 dark:bg-slate-900/50">
                                            <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                                        </div>
                                        <CardTitle className="dark:text-white">{title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
