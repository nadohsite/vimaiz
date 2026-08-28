<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\NotificationPayload;
use App\Support\NotificationTarget;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        /** @var User $user */
        $user = auth()->user();

        $page = $user->notifications()
            ->latest()
            ->paginate(20);

        $page->setCollection(
            $page->getCollection()
                ->map(fn ($notification) => NotificationPayload::from($notification))
                ->values()
        );

        return Inertia::render('notifications/index', [
            'paginatedNotifications' => $page,
        ]);
    }

    public function open(string $id): RedirectResponse
    {
        /** @var User $user */
        $user = auth()->user();

        $notification = $user->notifications()->find($id);

        if (! $notification) {
            return redirect()->route('notifications.index')
                ->with('info', 'Cette notification n\'existe plus.');
        }

        $notification->markAsRead();

        $data = is_array($notification->data) ? $notification->data : [];
        $url = $data['url'] ?? null;

        if (! is_string($url) || $url === '') {
            return redirect()->route('notifications.index');
        }

        if (! NotificationTarget::exists($data)) {
            return redirect()->route('notifications.index')
                ->with('info', NotificationTarget::unavailableMessage($data));
        }

        return redirect()->to($url);
    }

    public function markAsRead(string $id): RedirectResponse
    {
        /** @var User $user */
        $user = auth()->user();

        $notification = $user->notifications()->find($id);

        if (! $notification) {
            return redirect()->route('notifications.index')
                ->with('info', 'Cette notification n\'existe plus.');
        }

        $notification->markAsRead();

        return back();
    }

    public function markAllAsRead(): RedirectResponse
    {
        /** @var User $user */
        $user = auth()->user();

        $user->unreadNotifications->markAsRead();

        return back();
    }

    public function destroy(string $id): RedirectResponse
    {
        /** @var User $user */
        $user = auth()->user();

        $notification = $user->notifications()->find($id);

        if (! $notification) {
            return redirect()->route('notifications.index')
                ->with('info', 'Cette notification n\'existe plus.');
        }

        $notification->delete();

        return back();
    }
}
