<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\NotificationPayload;
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

    public function markAsRead(string $id): RedirectResponse
    {
        /** @var User $user */
        $user = auth()->user();

        $notification = $user->notifications()->findOrFail($id);
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

        $notification = $user->notifications()->findOrFail($id);
        $notification->delete();

        return back();
    }
}
