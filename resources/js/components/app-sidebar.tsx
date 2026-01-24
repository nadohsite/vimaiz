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
    Wallet
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User & { role: string } } }>().props;
    const user = auth.user;
    const isAgent = user.role === 'agent';

    // Navigation Client selon CAHIER_DES_CHARGES VIMAIZ
    const clientNavItems: NavItem[] = [
        {
            title: 'Tableau de bord',
            href: route('dashboard'),
            icon: LayoutGrid,
        },
        {
            title: 'Mes logements',
            href: route('client.properties.index'),
            icon: Home,
        },
        {
            title: 'Demander un ménage',
            href: route('client.requests.create'),
            icon: Plus,
        },
        {
            title: 'Mes demandes',
            href: route('client.requests.index'),
            icon: ClipboardList,
        },
        {
            title: 'Historique & Factures',
            href: route('client.missions.index'),
            icon: FileText,
        },
        {
            title: 'Messages',
            href: route('messages.index'),
            icon: MessageSquare,
        },
        {
            title: 'Mon Profil',
            href: route('settings.profile.edit'),
            icon: Settings,
        },
    ];

    // Navigation Agent selon CAHIER_DES_CHARGES VIMAIZ
    const agentNavItems: NavItem[] = [
        {
            title: 'Tableau de bord',
            href: route('agent.dashboard'),
            icon: LayoutGrid,
        },
        {
            title: 'Mes Missions',
            href: route('agent.missions.index'),
            icon: Briefcase,
        },
        {
            title: 'Mon Portefeuille',
            href: route('agent.wallet.index'),
            icon: Wallet,
        },
        {
            title: 'Messages',
            href: route('messages.index'),
            icon: MessageSquare,
        },
        {
            title: 'Mon Profil',
            href: route('settings.profile.edit'),
            icon: Settings,
        },
    ];

    const mainNavItems = isAgent ? agentNavItems : clientNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
