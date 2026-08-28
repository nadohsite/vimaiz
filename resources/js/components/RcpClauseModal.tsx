import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RcpClauseModalProps {
    show: boolean;
    onAccepted?: () => void;
}

export default function RcpClauseModal({ show, onAccepted }: RcpClauseModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!show) {
            setIsVisible(false);
            return;
        }

        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, [show]);

    const handleAccept = () => {
        if (!isChecked) {
            return;
        }

        setIsSubmitting(true);
        router.post(route('agent.rcp-acceptance.store'), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsVisible(false);
                onAccepted?.();
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain p-3 sm:p-4"
            style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))', paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rcp-modal-title"
        >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" />

            <div
                className={cn(
                    'relative z-[101] my-auto flex w-full max-w-lg flex-col overflow-hidden',
                    'max-h-[min(100dvh-1.5rem,42rem)] sm:max-h-[min(100dvh-2rem,44rem)]',
                    'rounded-2xl border border-slate-200 bg-white shadow-2xl',
                    'dark:border-slate-700 dark:bg-slate-800',
                    'animate-in fade-in zoom-in-95 duration-300',
                )}
            >
                <div className="shrink-0 border-b border-slate-100 p-4 sm:p-6 sm:pb-4 dark:border-slate-700">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 sm:h-12 sm:w-12">
                            <Shield className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 id="rcp-modal-title" className="text-lg font-bold leading-tight text-slate-900 dark:text-white sm:text-xl">
                                Clause de Responsabilité Civile Professionnelle
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                                Document obligatoire pour exercer en tant qu'intervenant VIMAIZ
                            </p>
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
                    <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 dark:border-sky-800 dark:bg-sky-900/30 sm:p-4">
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            En tant qu'intervenant VIMAIZ, vous devez disposer d'une assurance Responsabilité Civile Professionnelle (RCP). Si vous n'en disposez pas lors de votre inscription, vous vous engagez à en souscrire une dans un délai de trois (03) mois. À défaut de régularisation dans ce délai, des pénalités pourront être appliquées conformément aux Conditions Générales d'Utilisation.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                            Ce que couvre la RCP :
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 text-sky-500">•</span>
                                <span>Dommages matériels causés au domicile du client</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 text-sky-500">•</span>
                                <span>Bris d'objets pendant l'intervention</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 text-sky-500">•</span>
                                <span>Protection juridique en cas de litige</span>
                            </li>
                        </ul>
                    </div>

                    <a
                        href={route('agent.rcp-acceptance')}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-2 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                    >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span>Lire la clause complète</span>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                    </a>

                    <div className="flex items-start gap-3 pt-1">
                        <Checkbox
                            id="rcp-accept"
                            checked={isChecked}
                            onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                            className="mt-0.5 border-slate-300 data-[state=checked]:border-sky-500 data-[state=checked]:bg-sky-500 dark:border-slate-600"
                        />
                        <Label
                            htmlFor="rcp-accept"
                            className="cursor-pointer text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                        >
                            J'ai lu et j'accepte la clause de Responsabilité Civile Professionnelle (RCP)
                            de VIMAIZ
                        </Label>
                    </div>
                </div>

                <div className="shrink-0 border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 sm:p-6 sm:pt-4">
                    <Button
                        onClick={handleAccept}
                        disabled={!isChecked || isSubmitting}
                        className={cn(
                            'h-11 w-full rounded-xl text-sm font-semibold transition-all sm:h-12 sm:text-base',
                            isChecked
                                ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/25 hover:from-sky-600 hover:to-cyan-600'
                                : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500',
                        )}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Validation en cours...
                            </span>
                        ) : (
                            <>
                                <Shield className="mr-2 h-5 w-5" />
                                Accepter et continuer
                            </>
                        )}
                    </Button>
                    <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                        Cette acceptation est requise pour recevoir des interventions.
                    </p>
                </div>
            </div>
        </div>
    );
}

export function AgentRcpGate() {
    const page = usePage<{
        auth?: { user?: { role?: string } | null };
        rcpClauseAccepted?: boolean;
    }>();
    const { auth, rcpClauseAccepted = true } = page.props;
    const isAgent = auth?.user?.role === 'agent';
    const onRcpPage = page.url.includes('/rcp-acceptance');

    if (!isAgent || rcpClauseAccepted || onRcpPage) {
        return null;
    }

    return <RcpClauseModal show />;
}
