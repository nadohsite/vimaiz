import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface AgentProfile {
    id: number;
    rcp_clause_accepted: boolean;
    rcp_clause_accepted_at: string | null;
}

interface Props {
    agentProfile: AgentProfile;
}

const breadcrumbs = [
    { title: 'Dashboard', href: route('agent.dashboard') },
    { title: 'Clause RCP', href: route('agent.rcp-acceptance') },
];

export default function RCPAcceptance({ agentProfile }: Props) {
    const [accepted, setAccepted] = useState(agentProfile.rcp_clause_accepted);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!accepted) {
            alert('Vous devez accepter la clause pour continuer.');
            return;
        }

        setSubmitting(true);

        router.post(route('agent.rcp-acceptance.store'), {}, {
            onSuccess: () => {
                // Rediriger vers le dashboard
                router.visit(route('agent.dashboard'));
            },
            onError: () => {
                setSubmitting(false);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clause Responsabilité Civile Professionnelle" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Clause Responsabilité Civile Professionnelle (RCP)
                        </h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Veuillez lire attentivement et accepter cette clause pour continuer.
                        </p>
                    </div>

                    {agentProfile.rcp_clause_accepted ? (
                        <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                                        <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-green-900 dark:text-green-100">
                                            Clause acceptée
                                        </h3>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            Vous avez accepté la clause RCP le{' '}
                                            {new Date(agentProfile.rcp_clause_accepted_at!).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 mb-6">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
                                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-red-900 dark:text-red-100">
                                            Action requise
                                        </h3>
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            Vous devez accepter cette clause pour accéder à toutes les fonctionnalités de la plateforme.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="dark:text-white">
                                📌 Clause Responsabilité Civile Professionnelle (RCP)
                            </CardTitle>
                            <CardDescription className="dark:text-slate-400">
                                Document juridique concernant l'assurance professionnelle
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="prose prose-slate max-w-none dark:prose-invert">
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    Tout agent de ménage ne disposant pas d'une assurance <strong>Responsabilité Civile Professionnelle (RCP) valide</strong> reconnaît 
                                    et accepte assumer seul l'entière responsabilité de tous les dommages matériels, corporels ou immatériels causés à des tiers 
                                    dans le cadre de ses prestations.
                                </p>

                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    En l'absence de RCP, <strong>la plateforme ne pourra en aucun cas être tenue responsable</strong> des dommages causés par l'agent, 
                                    quels qu'ils soient.
                                </p>

                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    L'agent reconnaît avoir été informé de l'obligation de disposer d'une RCP et accepte cette clause en toute connaissance de cause.
                                </p>
                            </div>

                            {!agentProfile.rcp_clause_accepted && (
                                <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t dark:border-slate-700">
                                    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <Checkbox
                                            id="accept-rcp"
                                            checked={accepted}
                                            onCheckedChange={(checked) => setAccepted(checked === true)}
                                            className="mt-1"
                                            required
                                        />
                                        <label
                                            htmlFor="accept-rcp"
                                            className="text-sm font-medium leading-relaxed cursor-pointer dark:text-slate-200"
                                        >
                                            ☑️ Je reconnais avoir pris connaissance de cette clause et l'accepter sans réserve.
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Button
                                            type="submit"
                                            disabled={!accepted || submitting}
                                            className="bg-sky-500 hover:bg-sky-600"
                                        >
                                            {submitting ? 'Enregistrement...' : 'Valider et continuer'}
                                        </Button>
                                        {!accepted && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Veuillez cocher la case pour continuer
                                            </p>
                                        )}
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="mt-6 bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-sky-100 dark:bg-sky-900/30 rounded-full p-3">
                                    <Shield className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sky-900 dark:text-sky-100 mb-2">
                                        Pourquoi cette clause ?
                                    </h3>
                                    <p className="text-sm text-sky-700 dark:text-sky-300">
                                        Cette clause protège à la fois les agents et la plateforme en définissant clairement les responsabilités 
                                        en cas de dommages. Il est fortement recommandé de souscrire à une assurance RCP pour exercer votre 
                                        activité en toute sérénité.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
