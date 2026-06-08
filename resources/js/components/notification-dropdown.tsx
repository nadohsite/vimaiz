import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePage, router, Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { getNotificationIcon } from '@/lib/notification-icons';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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
    notifications?: Notification[];
    unreadNotificationsCount?: number;
    [key: string]: any;
}

const formatTime = (dateString: string) => {
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
    } catch {
        return dateString;
    }
};

export function NotificationDropdown() {
    const { notifications = [], unreadNotificationsCount = 0 } = usePage<PageProps>().props;

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        router.post(route('notifications.mark-read', notification.id), {}, {
            preserveScroll: true,
            preserveState: true,
        });

        // Navigate to URL if provided
        if (notification.data.url) {
            router.visit(notification.data.url);
        }
    };

    const handleMarkAllRead = () => {
        router.post(route('notifications.mark-all-read'), {}, {
            preserveScroll: true,
            preserveState: true,
        });
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
                            const { icon: Icon, color } = getNotificationIcon(notification.data.type);
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
                                            {notification.data.message}
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
                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="flex justify-center p-2">
                            <Link
                                href={route('notifications.index')}
                                className="w-full text-center text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
                            >
                                Voir toutes les notifications
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
