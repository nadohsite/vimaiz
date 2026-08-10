<?php

namespace App\Filament\Widgets;

use App\Models\User;
use App\Models\Mission;
use App\Models\ServiceRequest;
use App\Models\Quote;
use App\Models\Property;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $totalRevenue = Mission::where('status', 'completed')
            ->where('payment_status', 'paid')
            ->sum('total_price');

        $monthlyRevenue = Mission::where('status', 'completed')
            ->where('payment_status', 'paid')
            ->where('completed_at', '>=', now()->startOfMonth())
            ->sum('total_price');

        $pendingQuotes = Quote::where('status', 'draft')->count();
        $pendingMissions = Mission::where('status', 'pending_agent')->count();

        return [
            Stat::make('Chiffre d\'affaires', number_format($totalRevenue, 0, ',', ' ') . ' €')
                ->description('+ ' . number_format($monthlyRevenue, 0, ',', ' ') . ' € ce mois')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success'),
            
            Stat::make('Demandes en attente', ServiceRequest::where('status', 'pending')->count())
                ->description($pendingQuotes . ' devis à envoyer')
                ->descriptionIcon('heroicon-m-clipboard-document-list')
                ->color('warning'),

            Stat::make('Interventions en cours', Mission::whereIn('status', ['agent_accepted', 'in_progress'])->count())
                ->description($pendingMissions . ' en attente d\'intervenant')
                ->descriptionIcon('heroicon-m-briefcase')
                ->color('primary'),

            Stat::make('Intervenants actifs', User::where('role', 'agent')->where('is_active', true)->count())
                ->description(User::where('role', 'client')->where('is_active', true)->count() . ' clients')
                ->descriptionIcon('heroicon-m-users')
                ->color('info'),
        ];
    }
}
