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
