import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationDropdown } from '@/components/notification-dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { getAvatarUrl } from '@/lib/utils';
import { type BreadcrumbItem as BreadcrumbItemType, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-sidebar-border/60 bg-background/90 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 sm:h-16 sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <SidebarTrigger className="size-10 shrink-0 rounded-xl border border-border/70 bg-background shadow-sm hover:bg-accent md:size-9" />
                <div className="min-w-0 overflow-hidden">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-muted/40 p-0.5 sm:gap-1 sm:px-1">
                    <AppearanceToggleDropdown />
                    <NotificationDropdown />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="size-10 rounded-full p-0 overflow-hidden border border-border/70 shadow-sm sm:size-9"
                        >
                            <Avatar className="size-full rounded-full">
                                <AvatarImage
                                    src={getAvatarUrl(auth.user.avatar, auth.user.name)}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
