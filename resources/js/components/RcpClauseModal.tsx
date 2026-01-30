import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, FileText, ExternalLink, X } from 'lucide-react';
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
        if (show) {
            // Delay before showing the modal (like cookie consent)
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [show]);

    const handleAccept = () => {
        if (!isChecked) return;
        
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

    if (!isVisible) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
            
            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-4">
                <div 
                    className={cn(
                        "w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
                        "animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300",
                        "border border-slate-200 dark:border-slate-700"
                    )}
                >
                    {/* Header */}
                    <div className="relative p-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Clause de Responsabilité Civile Professionnelle
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Document obligatoire pour exercer en tant qu'agent VIMAIZ
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-5">
                        <div className="bg-sky-50 dark:bg-sky-900/30 rounded-xl p-4 border border-sky-100 dark:border-sky-800">
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                En tant qu'agent de ménage VIMAIZ, vous devez accepter la clause de Responsabilité 
                                Civile Professionnelle (RCP). Cette clause vous couvre en cas de dommages 
                                accidentels causés lors de vos missions.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                                Ce que couvre la RCP :
                            </h4>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-sky-500 mt-0.5">•</span>
                                    <span>Dommages matériels causés au domicile du client</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-sky-500 mt-0.5">•</span>
                                    <span>Bris d'objets pendant l'intervention</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-sky-500 mt-0.5">•</span>
                                    <span>Protection juridique en cas de litige</span>
                                </li>
                            </ul>
                        </div>

                        {/* Link to full document */}
                        <a 
                            href={route('agent.rcp-acceptance')} 
                            target="_blank"
                            className="flex items-center gap-2 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors group"
                        >
                            <FileText className="h-4 w-4" />
                            <span>Lire la clause complète</span>
                            <ExternalLink className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </a>

                        {/* Checkbox */}
                        <div className="flex items-start gap-3 pt-2">
                            <Checkbox 
                                id="rcp-accept"
                                checked={isChecked}
                                onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                                className="mt-0.5 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                            />
                            <Label 
                                htmlFor="rcp-accept" 
                                className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer leading-relaxed"
                            >
                                J'ai lu et j'accepte la clause de Responsabilité Civile Professionnelle (RCP) 
                                de VIMAIZ
                            </Label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                        <Button
                            onClick={handleAccept}
                            disabled={!isChecked || isSubmitting}
                            className={cn(
                                "w-full h-12 text-base font-semibold rounded-xl transition-all",
                                isChecked 
                                    ? "bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white shadow-lg shadow-sky-500/25" 
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                            )}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Validation en cours...
                                </span>
                            ) : (
                                <>
                                    <Shield className="h-5 w-5 mr-2" />
                                    Accepter et continuer
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
                            Cette acceptation est requise pour recevoir des missions.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
