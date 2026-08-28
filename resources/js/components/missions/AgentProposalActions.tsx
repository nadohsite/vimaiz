import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useState, type MouseEvent } from 'react';

interface Props {
    missionId: number;
    variant?: 'proposal' | 'compact';
}

export function AgentProposalActions({ missionId, variant = 'proposal' }: Props) {
    const [processing, setProcessing] = useState<'accept' | 'refuse' | null>(null);

    const handleAccept = (event?: MouseEvent) => {
        event?.preventDefault();
        event?.stopPropagation();
        setProcessing('accept');
        router.post(route('agent.missions.accept', missionId), {}, {
            onFinish: () => setProcessing(null),
        });
    };

    const handleDecline = (event?: MouseEvent) => {
        event?.preventDefault();
        event?.stopPropagation();

        if (!confirm("Décliner cette intervention ? Vous ne la verrez plus, les autres intervenants pourront encore l'accepter.")) {
            return;
        }

        setProcessing('refuse');
        router.post(route('agent.missions.refuse', missionId), { reason: '' }, {
            onFinish: () => setProcessing(null),
        });
    };

    const compact = variant === 'compact';

    return (
        <div className={compact ? 'flex gap-2' : 'flex flex-col sm:flex-row gap-4'}>
            <Button
                type="button"
                onClick={handleAccept}
                disabled={processing !== null}
                className={`bg-green-500 hover:bg-green-600 ${compact ? '' : 'flex-1'}`}
                size={compact ? 'sm' : 'default'}
            >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accepter
            </Button>
            <Button
                type="button"
                variant="outline"
                onClick={handleDecline}
                disabled={processing !== null}
                className={`text-red-600 border-red-200 hover:bg-red-50 ${compact ? '' : 'flex-1'}`}
                size={compact ? 'sm' : 'default'}
            >
                <XCircle className="h-4 w-4 mr-2" />
                Décliner
            </Button>
        </div>
    );
}
