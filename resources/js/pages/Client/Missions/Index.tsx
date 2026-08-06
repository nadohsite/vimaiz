import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Home, User, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Property {
    id: number;
    name: string | null;
    type_label: string;
    city: string;
}

interface Agent {
    id: number;
    name: string;
}

interface Mission {
    id: number;
    mission_number: string;
    scheduled_at: string;
    status: string;
    status_label: string;
    property: Property;
    agent: Agent | null;
}

interface Props {
    missions: Mission[];
}

export default function Index({ missions = [] }: Props) {
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending_agent: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            agent_accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            in_progress: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
            photos_before: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            photos_after: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Mes interventions', href: route('client.missions.index') }]}>
            <Head title="Mes interventions" />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes interventions</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Suivez vos interventions en cours et passées</p>
                    </div>

                    {missions.length > 0 ? (
                        <div className="space-y-4">
                            {missions.map((mission) => (
                                <Link key={mission.id} href={route('client.missions.show', mission.id)} className="block mb-4 last:mb-0">
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-2 rounded-lg shrink-0 ${
                                                        mission.status === 'completed' ? 'bg-green-50 dark:bg-green-900/50' : 'bg-sky-50 dark:bg-sky-900/50'
                                                    }`}>
                                                        {mission.status === 'completed' ? (
                                                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                                                        ) : (
                                                            <Calendar className="h-6 w-6 text-sky-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                                {mission.mission_number}
                                                            </span>
                                                            <Badge className={getStatusColor(mission.status)}>
                                                                {mission.status_label}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <Home className="h-4 w-4" />
                                                                {mission.property.name || mission.property.type_label} - {mission.property.city}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {new Date(mission.scheduled_at).toLocaleDateString('fr-FR', {
                                                                    weekday: 'short',
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                            {mission.agent && (
                                                                <span className="flex items-center gap-1">
                                                                    <User className="h-4 w-4" />
                                                                    {mission.agent.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-12 dark:bg-slate-800 dark:border-slate-700">
                            <CardContent>
                                <div className="mx-auto w-16 h-16 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center mb-4">
                                    <Calendar className="h-8 w-8 text-sky-500 dark:text-sky-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    Aucune intervention
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Vos interventions apparaîtront ici après paiement de vos demandes.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
