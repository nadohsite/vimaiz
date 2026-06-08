import { Head, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Trash2, Check } from 'lucide-react';
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

interface PaginatedNotifications {
    data: Notification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props {
    notifications: PaginatedNotifications;
}

const breadcrumbs = [
    { title: 'Notifications', href: route('notifications.index') },
];

const formatTime = (dateString: string) => {
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
    } catch {
        return dateString;
    }
};

export default function NotificationsIndex({ notifications }: Props) {
    const handleMarkAsRead = (id: string) => {
        router.post(route('notifications.mark-read', id), {}, {
            preserveScroll: true,
        });
    };

    const handleMarkAllAsRead = () => {
        router.post(route('notifications.mark-all-read'), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Supprimer cette notification ?')) {
            router.delete(route('notifications.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleClick = (notification: Notification) => {
        if (!notification.read_at) {
            handleMarkAsRead(notification.id);
        }
        if (notification.data.url) {
            router.visit(notification.data.url);
        }
    };

    const unreadCount = notifications.data.filter(n => !n.read_at).length;

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Notifications
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {notifications.total} notification{notifications.total > 1 ? 's' : ''}
                            {unreadCount > 0 && ` (${unreadCount} non lue${unreadCount > 1 ? 's' : ''})`}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                            <Check className="mr-2 h-4 w-4" />
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>

                {notifications.data.length === 0 ? (
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardContent className="p-12 text-center">
                            <Bell className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                                Aucune notification
                            </h3>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Vous n'avez pas encore reçu de notifications.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {notifications.data.map((notification) => {
                            const { icon: Icon, color } = getNotificationIcon(notification.data.type);
                            const isUnread = !notification.read_at;

                            return (
                                <Card
                                    key={notification.id}
                                    className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                        isUnread 
                                            ? 'border-sky-200 bg-sky-50/50 dark:border-sky-800 dark:bg-sky-900/10' 
                                            : 'dark:bg-slate-800 dark:border-slate-700'
                                    }`}
                                    onClick={() => handleClick(notification)}
                                >
                                    <CardContent className="flex items-start gap-4 p-4">
                                        <div className={`shrink-0 rounded-full p-3 ${color}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-relaxed ${isUnread ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {notification.data.message}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {formatTime(notification.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isUnread && (
                                                <div className="h-2 w-2 rounded-full bg-sky-500" />
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notification.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!notifications.prev_page_url}
                            onClick={() => notifications.prev_page_url && router.visit(notifications.prev_page_url)}
                        >
                            Précédent
                        </Button>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            Page {notifications.current_page} sur {notifications.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!notifications.next_page_url}
                            onClick={() => notifications.next_page_url && router.visit(notifications.next_page_url)}
                        >
                            Suivant
                        </Button>
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
