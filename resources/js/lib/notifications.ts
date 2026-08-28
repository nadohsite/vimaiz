import { router } from '@inertiajs/react';

export function visitNotification(id: string) {
    router.visit(`/notifications/${id}/open`, {
        onError: () => {
            router.visit('/notifications');
        },
    });
}
