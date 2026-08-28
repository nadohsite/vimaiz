<?php

namespace App\Http\Middleware;

use App\Models\Message;
use App\Models\User;
use App\Support\NotificationPayload;
use Closure;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Handle the incoming request.
     * Skip Inertia for Filament admin routes to avoid conflict with Livewire.
     */
    public function handle(Request $request, Closure $next)
    {
        // Skip Inertia for Filament admin + Livewire (paths: livewire-{hash}/…)
        if (
            $request->is('admin', 'admin/*', 'livewire/*', 'filament/*')
            || str_starts_with($request->path(), 'livewire-')
        ) {
            return $next($request);
        }

        return parent::handle($request, $next);
    }

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();

        // Count unread messages for sidebar badge
        $unreadMessagesCount = 0;
        if ($user) {
            $unreadMessagesCount = Message::whereHas('conversation', function ($query) use ($user) {
                $query->where('client_id', $user->id)
                    ->orWhere('agent_id', $user->id);
            })
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->count();
        }

        $recentNotifications = [];
        if ($user) {
            $recentNotifications = NotificationPayload::collection(
                $user->notifications()->latest()->take(10)->get()
            );
        }

        return [
            ...parent::share($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'notifications' => $recentNotifications,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $user ? $user->unreadNotifications()->count() : 0,
            'unreadMessagesCount' => $unreadMessagesCount,
            'rcpClauseAccepted' => $this->rcpClauseAccepted($user),
        ];
    }

    protected function rcpClauseAccepted(?User $user): bool
    {
        if (! $user || ! $user->isAgent()) {
            return true;
        }

        $user->loadMissing('agentProfile');

        return (bool) $user->agentProfile?->rcp_clause_accepted;
    }
}
