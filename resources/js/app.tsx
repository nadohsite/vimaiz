import '../css/app.css';
import './echo';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MetaPixelProvider from '@/components/meta-pixel-provider';
import { initializeTheme } from './hooks/use-appearance';
import { route } from 'ziggy-js';
import { type SharedData } from '@/types';

// Make route function available globally
window.route = route;

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const sharedProps = props.initialPage.props as SharedData;

        root.render(
            <StrictMode>
                <App {...props} />
                <MetaPixelProvider pixelId={sharedProps.meta?.pixelId ?? null} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
