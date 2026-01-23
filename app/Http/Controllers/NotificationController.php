<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        
        $notifications = $user->notifications()
            ->latest()
            ->paginate(20);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    public function markAsRead(string $id): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        
        $notification = $user->notifications()->findOrFail($id);
        $notification->markAsRead();

        return back();
    }

    public function markAllAsRead(): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        
        $user->unreadNotifications->markAsRead();

        return back();
    }

    public function destroy(string $id): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        
        $notification = $user->notifications()->findOrFail($id);
        $notification->delete();

        return back();
    }
}
