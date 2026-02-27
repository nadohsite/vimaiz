import { Head, Link } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2, AlertCircle, Wallet, Star, Home, ChevronRight, Bell } from 'lucide-react';
import RcpClauseModal from '@/components/RcpClauseModal';
import { useState } from 'react';

interface Property {
    id: number;
    name: string | null;
    type_label: string;
    city: string;
}

interface Mission {
    id: number;
    mission_number: string;
    scheduled_at: string;
    duration_hours: number;
    agent_payout: number;
    property: Property;
}

interface Stats {
    total_earnings: number;
    pending_earnings: number;
    available_balance: number;
    missions_completed: number;
    missions_pending: number;
    missions_in_progress: number;
    internal_rating: number;
    is_eligible: boolean;
}

interface Props {
    stats: Stats;
    pendingMissions: Mission[];
    upcomingMissions: Mission[];
    recentMissions: Mission[];
    rcpClauseAccepted?: boolean;
}

export default function Dashboard({ stats, pendingMissions, upcomingMissions, recentMissions, rcpClauseAccepted = false }: Props) {
    const [showRcpModal, setShowRcpModal] = useState(!rcpClauseAccepted);

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Tableau de bord', href: route('agent.dashboard') }]}>
            <Head title="Tableau de bord Agent" />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tableau de bord</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Bienvenue sur votre espace agent VIMAIZ</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                            Vimaiz prélève une commission de 25 % sur chaque intervention pour couvrir les frais de mise en relation, de gestion de la plateforme et de support.
                        </p>
                    </div>

                    {!stats?.is_eligible && (
                        <Card className="mb-6 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                            <CardContent className="p-4 flex items-center gap-4">
                                <AlertCircle className="h-6 w-6 text-orange-500" />
                                <div className="flex-1">
                                    <p className="font-medium text-orange-800 dark:text-orange-300">Profil incomplet</p>
                                    <p className="text-sm text-orange-700 dark:text-orange-400">Complétez votre profil et soumettez vos documents pour recevoir des missions.</p>
                                </div>
                                <Link href={route('agent.documents.index')}>
                                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                                        Compléter mon profil
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {pendingMissions.length > 0 && (
                        <Card className="mb-6 border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20">
                            <CardContent className="p-4 flex items-center gap-4">
                                <Bell className="h-6 w-6 text-sky-500 animate-pulse" />
                                <div className="flex-1">
                                    <p className="font-medium text-sky-800 dark:text-sky-300">{pendingMissions.length} mission(s) en attente</p>
                                </div>
                                <Link href={route('agent.missions.index')}>
                                    <Button size="sm" className="bg-sky-500 hover:bg-sky-600">Voir</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Solde disponible</p>
                                        <p className="text-2xl font-bold dark:text-white">{stats?.available_balance ?? 0} €</p>
                                    </div>
                                    <Wallet className="h-8 w-8 text-green-500 dark:text-green-300" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Missions terminées</p>
                                        <p className="text-2xl font-bold dark:text-white">{stats?.missions_completed ?? 0}</p>
                                    </div>
                                    <CheckCircle2 className="h-8 w-8 text-sky-500 dark:text-sky-300" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">En attente</p>
                                        <p className="text-2xl font-bold dark:text-white">{stats?.missions_pending ?? 0}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-yellow-500 dark:text-yellow-300" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Note interne</p>
                                        <p className="text-2xl font-bold dark:text-white">{Number(stats?.internal_rating ?? 5).toFixed(1)}/5</p>
                                    </div>
                                    <Star className="h-8 w-8 text-purple-500 dark:text-purple-300" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="dark:text-white">Missions à venir</CardTitle>
                                <CardDescription className="dark:text-slate-400">Vos prochaines interventions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {upcomingMissions.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcomingMissions.map((m) => (
                                            <Link key={m.id} href={route('agent.missions.show', m.id)} className="flex items-center justify-between p-3 rounded-lg border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                                                <div>
                                                    <p className="font-medium text-sm dark:text-white">{m.mission_number}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.property.city} - {new Date(m.scheduled_at).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-green-600">{m.agent_payout} €</span>
                                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">Aucune mission à venir</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="dark:text-white">Missions récentes</CardTitle>
                                <CardDescription className="dark:text-slate-400">Dernières missions terminées</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentMissions.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentMissions.map((m) => (
                                            <Link key={m.id} href={route('agent.missions.show', m.id)} className="flex items-center justify-between p-3 rounded-lg border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                                                <div>
                                                    <p className="font-medium text-sm dark:text-white">{m.mission_number}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.property.city}</p>
                                                </div>
                                                <Badge className="bg-green-100 text-green-800">Terminée</Badge>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">Aucune mission récente</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* RCP Clause Modal */}
            <RcpClauseModal 
                show={showRcpModal} 
                onAccepted={() => setShowRcpModal(false)} 
            />
        </AppSidebarLayout>
    );
}
