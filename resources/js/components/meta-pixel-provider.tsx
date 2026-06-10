import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    getMarketingConsent,
    initMetaPixel,
    setMarketingConsent,
    trackPageView,
} from '@/lib/meta-pixel';

interface MetaPixelProviderProps {
    pixelId?: string | null;
}

export default function MetaPixelProvider({ pixelId = null }: MetaPixelProviderProps) {
    const [consent, setConsent] = useState<ReturnType<typeof getMarketingConsent>>(() => {
        const stored = getMarketingConsent();

        if (stored) {
            return stored;
        }

        return null;
    });

    const [showBanner, setShowBanner] = useState(() => getMarketingConsent() === null);

    useEffect(() => {
        if (!pixelId || consent !== 'accepted') {
            return;
        }

        initMetaPixel(pixelId);
    }, [pixelId, consent]);

    useEffect(() => {
        if (!pixelId || consent !== 'accepted') {
            return;
        }

        return router.on('navigate', () => {
            trackPageView();
        });
    }, [pixelId, consent]);

    const handleAccept = () => {
        setMarketingConsent(true);
        setConsent('accepted');
        setShowBanner(false);

        if (pixelId) {
            initMetaPixel(pixelId);
        }
    };

    const handleReject = () => {
        setMarketingConsent(false);
        setConsent('rejected');
        setShowBanner(false);
    };

    if (!pixelId || !showBanner) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4">
            <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-300">
                    Nous utilisons des cookies marketing pour mesurer l&apos;efficacité de nos publicités.
                    {' '}
                    <Link href={route('privacy')} className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                        En savoir plus
                    </Link>
                </div>
                <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={handleReject}>
                        Refuser
                    </Button>
                    <Button size="sm" onClick={handleAccept}>
                        Accepter
                    </Button>
                </div>
            </div>
        </div>
    );
}
