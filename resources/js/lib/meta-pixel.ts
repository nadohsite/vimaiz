declare global {
    interface Window {
        fbq?: FbqFunction;
        _fbq?: FbqFunction;
    }
}

type FbqFunction = {
    (...args: unknown[]): void;
    callMethod?: (...args: unknown[]) => void;
    queue: unknown[][];
    loaded?: boolean;
    version?: string;
    push: FbqFunction;
};

export const CONSENT_COOKIE = 'cookie_consent';

export type ConsentStatus = 'accepted' | 'rejected' | null;

export function getMarketingConsent(): ConsentStatus {
    const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));

    if (!match) {
        return null;
    }

    return match[1] === 'accepted' ? 'accepted' : 'rejected';
}

export function setMarketingConsent(accepted: boolean): void {
    const value = accepted ? 'accepted' : 'rejected';
    const maxAge = 365 * 24 * 60 * 60;

    document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

let initializedPixelId: string | null = null;

export function initMetaPixel(pixelId: string): boolean {
    if (!pixelId || getMarketingConsent() !== 'accepted') {
        return false;
    }

    if (initializedPixelId === pixelId && window.fbq) {
        return true;
    }

    if (!window.fbq) {
        const fbq = function (...args: unknown[]) {
            if (fbq.callMethod) {
                fbq.callMethod(...args);
            } else {
                fbq.queue.push(args);
            }
        } as FbqFunction;

        fbq.queue = [];
        fbq.push = fbq;
        window.fbq = fbq;
        window._fbq = fbq;

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';

        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode?.insertBefore(script, firstScript);
    }

    window.fbq?.('init', pixelId);
    window.fbq?.('track', 'PageView');

    initializedPixelId = pixelId;

    return true;
}

export function trackMetaEvent(
    event: string,
    params?: Record<string, unknown>,
    eventId?: string,
): void {
    if (!window.fbq || getMarketingConsent() !== 'accepted') {
        return;
    }

    if (eventId) {
        window.fbq('track', event, params ?? {}, { eventID: eventId });
        return;
    }

    window.fbq('track', event, params ?? {});
}

export function trackPageView(): void {
    trackMetaEvent('PageView');
}
