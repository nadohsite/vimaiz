import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';

import { type NavItem, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Home,
    Plus,
    ClipboardList,
    FileText,
    Settings,
    Briefcase,
    MessageSquare,
    Wallet,
    FolderCheck,
    Star,
    Shield,
    AlertTriangle,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth, unreadMessagesCount } = usePage<{
        auth: { user: User & { role: string } };
        unreadMessagesCount?: number;
    }>().props;
    const user = auth.user;
    const isAgent = user.role === 'agent';
    const unreadCount = unreadMessagesCount ?? 0;

    const clientNavItems: NavItem[] = [
        {
            title: 'Tableau de bord',
            href: route('dashboard'),
            icon: LayoutGrid,
        },
        {
            title: 'Mes biens',
            href: route('client.properties.index'),
            icon: Home,
        },
        {
            title: 'Nouvelle intervention',
            href: route('client.requests.create'),
            icon: Plus,
        },
        {
            title: 'Mes demandes',
            href: route('client.requests.index'),
            icon: ClipboardList,
        },
        {
            title: 'Mes interventions',
            href: route('client.missions.index'),
            icon: FileText,
        },
        {
            title: 'Messages',
            href: route('messages.index'),
            icon: MessageSquare,
            badge: unreadCount,
        },
        {
            title: 'Mon profil',
            href: route('settings.profile.edit'),
            icon: Settings,
        },
    ];

    const agentNavItems: NavItem[] = [
        {
            title: 'Tableau de bord',
            href: route('agent.dashboard'),
            icon: LayoutGrid,
        },
        {
            title: 'Mes interventions',
            href: route('agent.missions.index'),
            icon: Briefcase,
        },
        {
            title: 'Mes documents',
            href: route('agent.documents.index'),
            icon: FolderCheck,
        },
        {
            title: 'Clause RCP',
            href: route('agent.rcp-acceptance'),
            icon: Shield,
        },
        {
            title: 'Mon portefeuille',
            href: route('agent.wallet.index'),
            icon: Wallet,
        },
        {
            title: 'Mes avis',
            href: route('agent.reviews.index'),
            icon: Star,
        },
        {
            title: 'Retours clients',
            href: route('agent.returns.index'),
            icon: AlertTriangle,
        },
        {
            title: 'Messages',
            href: route('messages.index'),
            icon: MessageSquare,
            badge: unreadCount,
        },
        {
            title: 'Mon profil',
            href: route('settings.profile.edit'),
            icon: Settings,
        },
    ];

    const mainNavItems = isAgent ? agentNavItems : clientNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="h-14">
                            <Link href={route('dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="py-3">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/60 p-3">
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
