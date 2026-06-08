import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';

import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren, useMemo } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { url } = usePage();
    const currentPath = url.split('?')[0] ?? '/';

    const sidebarNavItems: NavItem[] = useMemo(
        () => [
            {
                title: 'Mon compte',
                href: route('settings.profile.edit'),
                icon: null,
            },
            {
                title: 'Mot de passe',
                href: route('settings.password.edit'),
                icon: null,
            },
            {
                title: 'Sécurité',
                href: route('settings.two-factor.show'),
                icon: null,
            },
            {
                title: 'Apparence',
                href: route('settings.appearance.edit'),
                icon: null,
            },
        ],
        [],
    );

    return (
        <div className="px-4 py-6">
            <Heading
                title="Mon compte"
                description="Modifiez vos informations personnelles, votre mot de passe et vos préférences"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${resolveUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isSameUrl(
                                        currentPath,
                                        item.href,
                                    ),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
