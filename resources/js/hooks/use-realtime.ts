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

interface Notification {
    id: string;
    type: string;
    message: string;
    url?: string;
    data: Record<string, unknown>;
}

export function useRealtime(userId: number | null) {
    useEffect(() => {
        if (!userId || !window.Echo) return;

        const channel = window.Echo.private(`user.${userId}`);

        // Listen for new messages
        channel.listen('.new-message', (data: Message) => {
            // Refresh the current page to get new messages
            router.reload({ only: ['messages', 'conversations', 'unreadCount'] });
            
            // Show browser notification if permitted
            if (Notification.permission === 'granted') {
                new Notification(`Nouveau message de ${data.sender_name}`, {
                    body: data.message.substring(0, 100),
                    icon: '/favicon.ico',
                });
            }
        });

        // Listen for new notifications
        channel.listen('.new-notification', (data: Notification) => {
            // Refresh notifications
            router.reload({ only: ['notifications', 'unreadNotificationsCount'] });
            
            // Show browser notification if permitted
            if (Notification.permission === 'granted') {
                new Notification('VIMAIZ', {
                    body: data.message,
                    icon: '/favicon.ico',
                });
            }
        });

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
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}
