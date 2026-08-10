import RcpClauseModal from '@/components/RcpClauseModal';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Bell,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    Hourglass,
    MapPin,
    Sparkles,
    Star,
    User,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

interface Property {
    id: number;
    name: string | null;
    type_label?: string;
    type?: string;
    city: string;
}

interface Mission {
    id: number;
    mission_number: string;
    scheduled_at: string;
    duration_hours: number;
    agent_payout: number;
    property: Property;
    client?: {
        name: string;
    };
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

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function propertyLabel(property: Property) {
    return property.name || `${property.type_label ?? property.type ?? 'Bien'} — ${property.city}`;
}

export default function Dashboard({
    stats,
    pendingMissions,
    upcomingMissions,
    recentMissions,
    rcpClauseAccepted = false,
}: Props) {
    const [showRcpModal, setShowRcpModal] = useState(!rcpClauseAccepted);
    const { auth } = usePage<SharedData>().props;
    const firstName = auth.user?.first_name || auth.user?.name?.split(' ')[0] || '';

    const statCards = [
        {
            icon: Wallet,
            label: 'Solde disponible',
            value: `${Number(stats?.available_balance ?? 0).toFixed(2)} €`,
            iconClass:
                'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
        },
        {
            icon: Hourglass,
            label: 'En attente de paiement',
            value: `${Number(stats?.pending_earnings ?? 0).toFixed(2)} €`,
            iconClass:
                'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
        },
        {
            icon: CheckCircle2,
            label: 'Interventions terminées',
            value: stats?.missions_completed ?? 0,
            iconClass: 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400',
        },
        {
            icon: Star,
            label: 'Note interne',
            value: `${Number(stats?.internal_rating ?? 5).toFixed(1)}/5`,
            iconClass: 'bg-primary/10 text-primary',
        },
    ];

    const quickLinks = [
        {
            href: route('agent.missions.index'),
            icon: Sparkles,
            title: 'Mes interventions',
            description: 'Toutes vos interventions',
        },
        {
            href: route('agent.wallet.index'),
            icon: Wallet,
            title: 'Mon portefeuille',
            description: 'Gains et retraits',
        },
        {
            href: route('agent.documents.index'),
            icon: FileText,
            title: 'Mes documents',
            description: 'Profil et vérification',
        },
    ];

    return (
        <AppSidebarLayout
            breadcrumbs={[{ title: 'Tableau de bord', href: route('agent.dashboard') }]}
        >
            <Head title="Tableau de bord Intervenant - VIMAIZ" />

            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 p-3 dark:from-slate-900 dark:to-slate-950 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Welcome banner */}
                    <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:mb-6 sm:p-8">
                        <div
                            className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
                            aria-hidden="true"
                        />
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                            <div className="min-w-0">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                    Bonjour{firstName ? ` ${firstName}` : ''}
                                </h1>
                                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                                    Gérez vos interventions et suivez vos revenus.
                                </p>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
                                    Vimaiz prélève une commission de 20 % sur chaque intervention
                                    pour couvrir la mise en relation, la gestion de la plateforme
                                    et le support.
                                </p>
                            </div>
                            {(stats?.missions_in_progress ?? 0) > 0 && (
                                <div className="flex flex-none items-center gap-3 rounded-xl bg-sky-50 px-4 py-3 dark:bg-sky-900/30">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
                                    </span>
                                    <span className="text-sm font-semibold text-sky-800 dark:text-sky-300">
                                        {stats.missions_in_progress} intervention
                                        {stats.missions_in_progress > 1 ? 's' : ''} en cours
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Eligibility warning */}
                    {!stats?.is_eligible && (
                        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-800 dark:bg-orange-900/20 sm:flex-row sm:items-center">
                            <div className="flex flex-none items-center justify-center rounded-xl bg-orange-100 p-3 dark:bg-orange-900/50">
                                <AlertCircle className="h-6 w-6 text-orange-500" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-orange-800 dark:text-orange-300">
                                    Profil incomplet — vous ne recevez pas encore d'interventions
                                </p>
                                <p className="text-sm text-orange-700 dark:text-orange-400">
                                    Complétez votre profil et soumettez vos documents pour être
                                    éligible.
                                </p>
                            </div>
                            <Link
                                href={route('agent.documents.index')}
                                className="inline-flex flex-none items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                            >
                                Compléter mon profil
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((card) => (
                            <div
                                key={card.label}
                                className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`rounded-xl p-3 ${card.iconClass}`}>
                                        <card.icon className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {card.label}
                                        </p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {card.value}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pending missions — needs response */}
                    {pendingMissions.length > 0 && (
                        <section className="mb-8">
                            <div className="mb-4 flex items-center gap-2">
                                <Bell className="h-5 w-5 animate-pulse text-amber-500" />
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Interventions en attente de votre réponse
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {pendingMissions.map((mission) => (
                                    <div
                                        key={mission.id}
                                        className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20"
                                    >
                                        <div className="mb-3 flex items-start justify-between">
                                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                                À confirmer
                                            </span>
                                            <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                                                {Number(mission.agent_payout).toFixed(0)} €
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-slate-900 capitalize dark:text-white">
                                            {propertyLabel(mission.property)}
                                        </h3>
                                        <div className="mt-2 mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(mission.scheduled_at)}
                                            </span>
                                            {mission.duration_hours && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4" />
                                                    {mission.duration_hours}h
                                                </span>
                                            )}
                                            {mission.client && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <User className="h-4 w-4" />
                                                    {mission.client.name}
                                                </span>
                                            )}
                                        </div>
                                        <Link
                                            href={route('agent.missions.show', mission.id)}
                                            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                                        >
                                            Voir et répondre
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                        {/* Missions column */}
                        <div className="space-y-8 xl:col-span-2">
                            {/* Upcoming */}
                            <section>
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        Interventions à venir
                                    </h2>
                                    <Link
                                        href={route('agent.missions.index')}
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        Voir tout →
                                    </Link>
                                </div>
                                {upcomingMissions.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcomingMissions.map((mission) => (
                                            <Link
                                                key={mission.id}
                                                href={route('agent.missions.show', mission.id)}
                                                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                                            >
                                                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10">
                                                    <Sparkles className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                                                        {propertyLabel(mission.property)}
                                                    </p>
                                                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {formatDate(mission.scheduled_at)}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            {mission.property.city}
                                                        </span>
                                                        <span className="font-mono">
                                                            {mission.mission_number}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="flex flex-none items-center gap-2">
                                                    <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                        {Number(mission.agent_payout).toFixed(0)} €
                                                    </span>
                                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-800">
                                        <div className="mx-auto mb-3 w-fit rounded-full bg-primary/10 p-3">
                                            <Calendar className="h-6 w-6 text-primary" />
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            Aucune intervention à venir
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            Les nouvelles interventions vous seront proposées ici.
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Recent */}
                            {recentMissions.length > 0 && (
                                <section>
                                    <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                                        Dernières interventions terminées
                                    </h2>
                                    <div className="space-y-3">
                                        {recentMissions.map((mission) => (
                                            <Link
                                                key={mission.id}
                                                href={route('agent.missions.show', mission.id)}
                                                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                                            >
                                                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                                                        {propertyLabel(mission.property)}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                        {mission.mission_number} — {mission.property.city}
                                                    </p>
                                                </div>
                                                <div className="flex flex-none flex-col items-end gap-1">
                                                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                        Intervention terminée
                                                    </span>
                                                    <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                                                        {Number(mission.agent_payout).toFixed(0)} €
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Side column */}
                        <div className="space-y-8">
                            <section>
                                <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                                    Accès rapide
                                </h2>
                                <div className="space-y-3">
                                    {quickLinks.map((link) => (
                                        <Link
                                            key={link.title}
                                            href={link.href}
                                            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                                        >
                                            <div className="rounded-xl bg-slate-100 p-2.5 transition-colors group-hover:bg-primary/10 dark:bg-slate-700">
                                                <link.icon className="h-5 w-5 text-slate-600 transition-colors group-hover:text-primary dark:text-slate-300" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {link.title}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {link.description}
                                                </p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 flex-none text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            {/* Earnings summary */}
                            <section>
                                <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                                    Mes revenus
                                </h2>
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                                    <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3 dark:border-slate-700">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Total gagné
                                        </span>
                                        <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                                            {Number(stats?.total_earnings ?? 0).toFixed(2)} €
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-dashed border-slate-200 py-3 dark:border-slate-700">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            En attente
                                        </span>
                                        <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                                            {Number(stats?.pending_earnings ?? 0).toFixed(2)} €
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-3">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Disponible
                                        </span>
                                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                            {Number(stats?.available_balance ?? 0).toFixed(2)} €
                                        </span>
                                    </div>
                                    <Link
                                        href={route('agent.wallet.index')}
                                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                                    >
                                        <Wallet className="h-4 w-4" />
                                        Gérer mon portefeuille
                                    </Link>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            {/* RCP Clause Modal */}
            <RcpClauseModal show={showRcpModal} onAccepted={() => setShowRcpModal(false)} />
        </AppSidebarLayout>
    );
}
