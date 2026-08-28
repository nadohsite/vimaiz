import { router } from '@inertiajs/react';
import { Component, type ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

type State = {
    hasError: boolean;
};

export class PageErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(): void {
        router.visit('/notifications', {
            onSuccess: () => this.setState({ hasError: false }),
        });
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center p-8 text-center">
                    <div>
                        <p className="text-lg font-medium text-slate-800 dark:text-slate-100">
                            Cette page n&apos;est plus disponible.
                        </p>
                        <a href="/notifications" className="mt-4 inline-block text-sky-600 hover:underline">
                            Retour aux notifications
                        </a>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
