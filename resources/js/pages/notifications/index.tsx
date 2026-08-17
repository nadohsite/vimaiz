import { Head, router, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, FileText, CreditCard, User, CheckCircle, Play, Wallet, AlertCircle, Trash2, Check } from 'lucide-react';
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
    paginatedNotifications?: PaginatedNotifications;
}

const breadcrumbs = [
    { title: 'Notifications', href: route('notifications.index') },
];

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
        return value as Notification[];
    }

    if (value && typeof value === 'object') {
        const maybeData = (value as PaginatedNotifications).data;
        if (Array.isArray(maybeData)) {
            return maybeData;
        }
        if (maybeData && typeof maybeData === 'object') {
            return Object.values(maybeData);
        }

        return Object.values(value as Record<string, Notification>).filter(
            (item) => item && typeof item === 'object' && 'id' in item,
        );
    }

    return [];
}

export default function NotificationsIndex({ paginatedNotifications }: Props) {
    const { recentNotifications, notifications: sharedNotifications } = usePage<{
        recentNotifications?: Notification[];
        notifications?: Notification[] | PaginatedNotifications;
        [key: string]: unknown;
    }>().props;

    const items = toNotificationList(
        paginatedNotifications?.data
            ?? paginatedNotifications
            ?? recentNotifications
            ?? sharedNotifications,
    );

    const total = paginatedNotifications?.total ?? items.length;

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
        if (notification.data?.url) {
            router.visit(notification.data.url);
        }
    };

    const unreadCount = items.filter(n => !n.read_at).length;

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
                            {total} notification{total > 1 ? 's' : ''}
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

                {items.length === 0 ? (
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
                        {items.map((notification) => {
                            const { icon: Icon, color } = getNotificationIcon(notification.data?.type);
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
                                                {notification.data?.message}
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
                {(paginatedNotifications?.last_page ?? 1) > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!paginatedNotifications?.prev_page_url}
                            onClick={() => paginatedNotifications?.prev_page_url && router.visit(paginatedNotifications.prev_page_url)}
                        >
                            Précédent
                        </Button>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            Page {paginatedNotifications?.current_page} sur {paginatedNotifications?.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!paginatedNotifications?.next_page_url}
                            onClick={() => paginatedNotifications?.next_page_url && router.visit(paginatedNotifications.next_page_url)}
                        >
                            Suivant
                        </Button>
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
