import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres d\'apparence',
        href: route('settings.appearance.edit'),
    },
];

export default function Appearance() {
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Paramètres d'apparence" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Paramètres d'apparence"
                        description="Personnalisez l'apparence de votre compte"
                    />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppSidebarLayout>
    );
}
