import { useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    sender_name: string;
    message: string;
    created_at: string;
}

interface VimaizNotification {
    type?: string;
    message?: string;
    url?: string;
    [key: string]: unknown;
}

function showBrowserNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/favicon.ico',
        });
    }
}

function refreshNotifications(notification?: VimaizNotification) {
    router.reload({ only: ['notifications', 'unreadNotificationsCount'] });

    if (notification?.message) {
        showBrowserNotification('VIMAIZ', notification.message);
    }
}

export function useRealtime(userId: number | null) {
    useEffect(() => {
        if (!userId || !window.Echo) return;

        const channel = window.Echo.private(`user.${userId}`);

        channel.listen('.new-message', (data: Message) => {
            router.reload({ only: ['messages', 'conversations', 'unreadCount'] });
            showBrowserNotification(
                `Nouveau message de ${data.sender_name}`,
                data.message.substring(0, 100),
            );
        });

        channel.listen('.new-notification', (data: VimaizNotification) => {
            refreshNotifications(data);
        });

        const userChannel = window.Echo.private(`App.Models.User.${userId}`);

        userChannel.notification((notification: VimaizNotification) => {
            refreshNotifications(notification);
        });

        return () => {
            channel.stopListening('.new-message');
            channel.stopListening('.new-notification');
            window.Echo.leave(`user.${userId}`);
            window.Echo.leave(`App.Models.User.${userId}`);
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
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}
