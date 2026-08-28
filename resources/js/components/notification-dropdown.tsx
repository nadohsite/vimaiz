import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePage, router } from '@inertiajs/react';
import { Bell, FileText, CreditCard, User, CheckCircle, Play, Wallet, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { visitNotification } from '@/lib/notifications';

interface Notification {
    id: string;
    type: string;
    data: {
        type: string;
        message: string;
        url?: string;
        [key: string]: any;
    };
    read_at: string | null;
    created_at: string;
}

interface PageProps {
    recentNotifications?: Notification[];
    notifications?: Notification[];
    unreadNotificationsCount?: number;
    [key: string]: any;
}

const getNotificationIcon = (type: string) => {
    const icons: Record<string, { icon: typeof Bell; color: string }> = {
        new_quote: { icon: FileText, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
        service_request_received: { icon: FileText, color: 'text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400' },
        payment_received: { icon: CreditCard, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
        mission_assigned: { icon: User, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' },
        agent_accepted: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
        mission_started: { icon: Play, color: 'text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400' },
        mission_completed: { icon: CheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
        agent_payout: { icon: Wallet, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
        quote_refused: { icon: AlertCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
        quote_accepted: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
        documents_verified: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
        documents_rejected: { icon: AlertCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
        agent_refused_client: { icon: AlertCircle, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
        mission_needs_agent: { icon: User, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400' },
    };
    return icons[type] || { icon: Bell, color: 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400' };
};

const formatTime = (dateString: string) => {
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
    } catch {
        return dateString;
    }
};

function toNotificationList(value: unknown): Notification[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === 'object') {
        return Object.values(value as Record<string, Notification>);
    }

    return [];
}

export function NotificationDropdown() {
    const {
        recentNotifications,
        notifications: sharedNotifications,
        unreadNotificationsCount = 0,
    } = usePage<PageProps>().props;
    const notifications = toNotificationList(recentNotifications ?? sharedNotifications);

    const handleNotificationClick = (notification: Notification) => {
        visitNotification(notification.id);
    };

    const handleMarkAllRead = () => {
        router.post(route('notifications.mark-all-read'), {}, {
            preserveScroll: true,
        });
    };

    const handleViewAll = () => {
        router.visit(route('notifications.index'));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-md">
                    <Bell className="h-5 w-5" />
                    {unreadNotificationsCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2">
                    <DropdownMenuLabel className="p-0 font-bold">Notifications</DropdownMenuLabel>
                    {unreadNotificationsCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400"
                        >
                            Tout marquer lu
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                            <Bell className="mx-auto h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                Aucune notification
                            </p>
                        </div>
                    ) : (
                        notifications.slice(0, 10).map((notification) => {
                            const { icon: Icon, color } = getNotificationIcon(notification.data?.type);
                            const isUnread = !notification.read_at;

                            return (
                                <DropdownMenuItem
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`flex cursor-pointer items-start gap-3 p-4 focus:bg-neutral-50 dark:focus:bg-neutral-800 ${
                                        isUnread ? 'bg-sky-50/50 dark:bg-sky-900/10' : ''
                                    }`}
                                >
                                    <div className={`shrink-0 rounded-full p-2 ${color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 space-y-1 overflow-hidden">
                                        <p className={`text-sm leading-tight ${isUnread ? 'font-semibold' : 'font-medium'}`}>
                                            {notification.data?.message}
                                        </p>
                                        <p className="text-[10px] text-neutral-400">
                                            {formatTime(notification.created_at)}
                                        </p>
                                    </div>
                                    {isUnread && (
                                        <div className="shrink-0 h-2 w-2 rounded-full bg-sky-500" />
                                    )}
                                </DropdownMenuItem>
                            );
                        })
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="flex justify-center p-2 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
                    onSelect={handleViewAll}
                >
                    Voir toutes les notifications
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
