import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2, AlertCircle, Wallet, Star, Home, ChevronRight, Bell } from 'lucide-react';

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
}

export default function Dashboard({ stats, pendingMissions, upcomingMissions, recentMissions }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Tableau de bord', href: route('agent.dashboard') }]}>
            <Head title="Tableau de bord Agent" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
                        <p className="text-slate-500 mt-1">Bienvenue sur votre espace agent VIMAIZ</p>
                    </div>

                    {!stats?.is_eligible && (
                        <Card className="mb-6 border-orange-200 bg-orange-50">
                            <CardContent className="p-4 flex items-center gap-4">
                                <AlertCircle className="h-6 w-6 text-orange-500" />
                                <div className="flex-1">
                                    <p className="font-medium text-orange-800">Profil incomplet</p>
                                    <p className="text-sm text-orange-700">Complétez votre profil pour recevoir des missions.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {pendingMissions.length > 0 && (
                        <Card className="mb-6 border-sky-200 bg-sky-50">
                            <CardContent className="p-4 flex items-center gap-4">
                                <Bell className="h-6 w-6 text-sky-500 animate-pulse" />
                                <div className="flex-1">
                                    <p className="font-medium text-sky-800">{pendingMissions.length} mission(s) en attente</p>
                                </div>
                                <Link href={route('agent.missions.index')}>
                                    <Button size="sm" className="bg-sky-500 hover:bg-sky-600">Voir</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Solde disponible</p>
                                        <p className="text-2xl font-bold">{stats?.available_balance ?? 0} MAD</p>
                                    </div>
                                    <Wallet className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Missions terminées</p>
                                        <p className="text-2xl font-bold">{stats?.missions_completed ?? 0}</p>
                                    </div>
                                    <CheckCircle2 className="h-8 w-8 text-sky-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">En attente</p>
                                        <p className="text-2xl font-bold">{stats?.missions_pending ?? 0}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-yellow-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Note interne</p>
                                        <p className="text-2xl font-bold">{Number(stats?.internal_rating ?? 5).toFixed(1)}/5</p>
                                    </div>
                                    <Star className="h-8 w-8 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Missions à venir</CardTitle>
                                <CardDescription>Vos prochaines interventions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {upcomingMissions.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcomingMissions.map((m) => (
                                            <Link key={m.id} href={route('agent.missions.show', m.id)} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50">
                                                <div>
                                                    <p className="font-medium text-sm">{m.mission_number}</p>
                                                    <p className="text-xs text-slate-500">{m.property.city} - {new Date(m.scheduled_at).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-green-600">{m.agent_payout} MAD</span>
                                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-4">Aucune mission à venir</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Missions récentes</CardTitle>
                                <CardDescription>Dernières missions terminées</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentMissions.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentMissions.map((m) => (
                                            <Link key={m.id} href={route('agent.missions.show', m.id)} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50">
                                                <div>
                                                    <p className="font-medium text-sm">{m.mission_number}</p>
                                                    <p className="text-xs text-slate-500">{m.property.city}</p>
                                                </div>
                                                <Badge className="bg-green-100 text-green-800">Terminée</Badge>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-4">Aucune mission récente</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
