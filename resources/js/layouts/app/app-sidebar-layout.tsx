import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { AgentRcpGate } from '@/components/RcpClauseModal';
import { useRealtime, requestNotificationPermission } from '@/hooks/use-realtime';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren, useEffect } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { auth, flash } = usePage<{
        auth: { user: { id: number } | null };
        flash?: { success?: string; error?: string; info?: string };
    }>().props;

    useRealtime(auth?.user?.id ?? null);

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {(flash?.success || flash?.info || flash?.error) && (
                    <div className="px-4 pt-4 space-y-2">
                        {(flash.success || flash.info) && (
                            <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-sky-800 text-sm dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-200">
                                {flash.success || flash.info}
                            </div>
                        )}
                        {flash.error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
                                {flash.error}
                            </div>
                        )}
                    </div>
                )}
                {children}
            </AppContent>
            <AgentRcpGate />
        </AppShell>
    );
}
