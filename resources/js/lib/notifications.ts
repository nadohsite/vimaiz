import { router } from '@inertiajs/react';

export function visitNotification(id: string) {
    router.visit(route('notifications.open', id));
}
