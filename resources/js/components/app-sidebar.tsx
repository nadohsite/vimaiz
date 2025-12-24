import { NavFooter } from '@/components/nav-footer';
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
    Search, 
    Calendar, 
    MapPin, 
    Wallet, 
    Star, 
    Settings,
    MessageSquare,
    ClipboardList
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User & { roles: { name: string }[] } } }>().props;
    const user = auth.user;
    const isAgent = user.roles?.some(r => r.name === 'agent');

    const clientNavItems: NavItem[] = [
        {
            title: 'Tableau de bord',
            href: route('dashboard'),
            icon: LayoutGrid,
        },
        {
            title: 'Trouver un agent',
            href: route('client.search'),
            icon: Search,
        },
        {
            title: 'Mes Réservations',
            href: route('client.bookings.index'),
            icon: Calendar,
        },
        {
            title: 'Mes Adresses',
            href: route('client.addresses.index'),
            icon: MapPin,
        },
        {
            title: 'Messages',
            href: '#', // À définir
            icon: MessageSquare,
        },
        {
            title: 'Mon Profil',
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
            title: 'Mes Missions',
            href: route('agent.bookings.index'),
            icon: ClipboardList,
        },
        {
            title: 'Mon Portefeuille',
            href: route('agent.dashboard'), // Placeholder wallet
            icon: Wallet,
        },
        {
            title: 'Avis & Notes',
            href: '#',
            icon: Star,
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
