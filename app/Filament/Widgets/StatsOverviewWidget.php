<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use App\Models\User;
use App\Models\AgentPayout;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Revenue', 'MAD ' . number_format(Booking::where('status', 'completed')->sum('total_amount'), 2))
                ->description('Total revenue from completed bookings')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success'),
            
            Stat::make('Total Bookings', Booking::count())
                ->description('All time bookings')
                ->descriptionIcon('heroicon-m-calendar')
                ->color('primary'),

            Stat::make('Active Agents', User::where('role', 'agent')->where('is_active', true)->count())
                ->description('Verified and active agents')
                ->descriptionIcon('heroicon-m-users')
                ->color('warning'),
                
            Stat::make('New Users (This Month)', User::where('created_at', '>=', now()->startOfMonth())->count())
                ->description('Users joined this month')
                ->descriptionIcon('heroicon-m-user-plus')
                ->color('info'),
        ];
    }
}
