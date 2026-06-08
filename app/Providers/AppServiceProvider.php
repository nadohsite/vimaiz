<?php

namespace App\Providers;

use App\Listeners\BroadcastDatabaseNotificationRefresh;
use App\Models\PlatformSetting;
use Illuminate\Notifications\Events\NotificationSent;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(NotificationSent::class, BroadcastDatabaseNotificationRefresh::class);

        if (Schema::hasTable('platform_settings')) {
            config([
                'vimaiz.commission_rate' => PlatformSetting::get('commission_rate', config('vimaiz.commission_rate')),
                'vimaiz.mission.agents_per_proposal' => PlatformSetting::get('agents_per_proposal', config('vimaiz.mission.agents_per_proposal')),
                'vimaiz.agent.manual_verification' => PlatformSetting::get('manual_verification', config('vimaiz.agent.manual_verification')),
                'vimaiz.booking.minimum_advance_hours' => PlatformSetting::get('minimum_advance_hours', config('vimaiz.booking.minimum_advance_hours')),
                'vimaiz.booking.maximum_advance_days' => PlatformSetting::get('maximum_advance_days', config('vimaiz.booking.maximum_advance_days')),
                'vimaiz.booking.cancellation_deadline_hours' => PlatformSetting::get('cancellation_deadline_hours', config('vimaiz.booking.cancellation_deadline_hours')),
            ]);
        }
    }
}
