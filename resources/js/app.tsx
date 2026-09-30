import '../css/app.css';
import './echo';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { PageErrorBoundary } from './components/page-error-boundary';
import { route } from 'ziggy-js';

// Make route function available globally
window.route = route;

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

router.on('invalid', (event) => {
    const status = event.detail.response.status;
    if (status === 403 || status === 404 || status === 500 || status === 503) {
        event.preventDefault();
        router.visit('/notifications');
    }
});

// On mobile, tapping the browser/OS back button after an action (e.g. an
// intervenant accepting or refusing a mission proposal) can restore the
// PREVIOUS page straight from the browser's back-forward cache (bfcache) —
// a full in-memory snapshot, restored with no JS re-run and no Inertia
// visit. That snapshot shows the page exactly as it was BEFORE the action
// (e.g. the "Accepter / Décliner" buttons still there for a mission that
// has already been accepted or refused), even though the server-side state
// has moved on. The server itself is not fooled — trying to act again on a
// mission that already changed status is rejected — but the visible
// buttons are stale and confusing until the user does something that
// triggers a real reload.
//
// `pageshow` with `event.persisted === true` is the standard signal that a
// page came back from bfcache rather than a fresh navigation. When that
// happens, force a fresh Inertia visit so the page reflects the mission's
// real current state (proposal actions correctly hidden once already
// accepted/refused, etc).
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        router.reload();
    }
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <PageErrorBoundary>
                    <App {...props} />
                </PageErrorBoundary>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
