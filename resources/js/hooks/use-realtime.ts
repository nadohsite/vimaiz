import { useEffect } from 'react';
import { router } from '@inertiajs/react';

interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    sender_name: string;
    message: string;
    created_at: string;
}

interface RealtimeNotification {
    id: string;
    type: string;
    message?: string;
    url?: string;
    data?: Record<string, unknown>;
}

function notificationOpenUrl(id?: string, url?: string | null): string {
    if (id) {
        return route('notifications.open', id);
    }

    if (url) {
        return url;
    }

    return route('notifications.index');
}

function notifyBrowser(title: string, body?: string, options?: { id?: string; url?: string | null }) {
    if (typeof window === 'undefined' || !('Notification' in window) || !body) {
        return;
    }

    if (window.Notification.permission !== 'granted') {
        return;
    }

    const notification = new window.Notification(title, {
        body: body.substring(0, 100),
        icon: '/favicon.ico',
        tag: options?.id,
        data: { id: options?.id, url: options?.url },
    });

    notification.onclick = () => {
        notification.close();
        window.focus();
        window.location.assign(notificationOpenUrl(options?.id, options?.url));
    };
}

export function useRealtime(userId: number | null) {
    useEffect(() => {
        if (!userId || !window.Echo) return;

        const channel = window.Echo.private(`user.${userId}`);

        // Listen for new messages
        channel.listen('.new-message', (data: Message) => {
            // Refresh the current page to get new messages
            router.reload({ only: ['messages', 'conversations', 'unreadCount'] });
            
            notifyBrowser(`Nouveau message de ${data.sender_name}`, data.message);
        });

        const handleNotification = (data: RealtimeNotification) => {
            router.reload({ only: ['recentNotifications', 'notifications', 'unreadNotificationsCount'] });

            const message = data.message
                ?? (typeof data.data?.message === 'string' ? data.data.message : undefined);
            const url = data.url
                ?? (typeof data.data?.url === 'string' ? data.data.url : undefined);

            notifyBrowser('VIMAIZ', message, { id: data.id, url });
        };

        channel.listen('.new-notification', handleNotification);
        channel.notification(handleNotification);

        return () => {
            channel.stopListening('.new-message');
            channel.stopListening('.new-notification');
            window.Echo.leave(`user.${userId}`);
        };
    }, [userId]);
}

export function useConversationRealtime(conversationId: number | null, onNewMessage: (message: Message) => void) {
    useEffect(() => {
        if (!conversationId || !window.Echo) return;

        const channel = window.Echo.private(`conversation.${conversationId}`);

        channel.listen('.new-message', (data: Message) => {
            onNewMessage(data);
        });

        return () => {
            channel.stopListening('.new-message');
            window.Echo.leave(`conversation.${conversationId}`);
        };
    }, [conversationId, onNewMessage]);
}

export function requestNotificationPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
        window.Notification.requestPermission();
    }
}
