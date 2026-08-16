import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ClipboardCheck, Clock, Wrench } from 'lucide-react';

export interface ReportAnomaly {
    id: number;
    category: string;
    category_label: string;
    type: string;
    label: string;
    notes: string | null;
    suggests_follow_up: boolean;
    follow_up_service_request_id: number | null;
}

export interface ReportSummary {
    submitted: boolean;
    nothing_to_report: boolean;
    checklist: { total: number; checked: number; complete: boolean };
    anomalies_count: number;
    actual_duration_label: string | null;
    estimated_duration_label: string | null;
}

interface Props {
    propertyName?: string | null;
    completedAt?: string | null;
    summary: ReportSummary;
    anomalies: ReportAnomaly[];
    propertyId?: number;
    showFollowUp?: boolean;
}

export default function InterventionReportCard({
    propertyName,
    completedAt,
    summary,
    anomalies,
    propertyId,
    showFollowUp = false,
}: Props) {
    if (!summary.submitted) {
        return null;
    }

    const dateLabel = completedAt
        ? new Date(completedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : null;

    const followUps = showFollowUp
        ? anomalies.filter((anomaly) => anomaly.suggests_follow_up && !anomaly.follow_up_service_request_id)
        : [];

    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base dark:text-white">
                    <ClipboardCheck className="h-5 w-5 text-sky-500" />
                    Rapport d&apos;intervention
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {(propertyName || dateLabel) && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        {propertyName}
                        {propertyName && dateLabel ? ' — ' : ''}
                        {dateLabel}
                    </p>
                )}

                {summary.checklist.total > 0 && (
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-700/50">
                        <span className="text-slate-500 dark:text-slate-400">Checklist</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            {summary.checklist.checked}/{summary.checklist.total} tâches complétées
                        </span>
                    </div>
                )}

                {summary.actual_duration_label && (
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-700/50">
                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            Durée de l&apos;intervention
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            {summary.actual_duration_label}
                        </span>
                    </div>
                )}

                {summary.nothing_to_report || anomalies.length === 0 ? (
                    <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>Aucune anomalie signalée.</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                            {anomalies.length} élément{anomalies.length > 1 ? 's' : ''} signalé
                            {anomalies.length > 1 ? 's' : ''}
                        </p>
                        <ul className="space-y-2">
                            {anomalies.map((anomaly) => (
                                <li
                                    key={anomaly.id}
                                    className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20"
                                >
                                    <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                                        {anomaly.category_label}
                                    </p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {anomaly.label}
                                    </p>
                                    {anomaly.notes && (
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                            {anomaly.notes}
                                        </p>
                                    )}
                                    {showFollowUp && propertyId && anomaly.suggests_follow_up && (
                                        <div className="mt-3">
                                            {anomaly.follow_up_service_request_id ? (
                                                <p className="text-xs text-slate-500">
                                                    Intervention de suivi déjà programmée.
                                                </p>
                                            ) : (
                                                <Link
                                                    href={route('client.requests.create', {
                                                        property_id: propertyId,
                                                        anomaly_id: anomaly.id,
                                                    })}
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-amber-300 text-amber-800 hover:bg-amber-100"
                                                    >
                                                        <Wrench className="mr-2 h-3.5 w-3.5" />
                                                        Programmer une intervention
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {followUps.length > 1 && propertyId && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Chaque signalement peut ouvrir une intervention de suivi dédiée.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
