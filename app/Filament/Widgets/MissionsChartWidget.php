<?php

namespace App\Filament\Widgets;

use App\Models\Mission;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class MissionsChartWidget extends ChartWidget
{
    protected ?string $heading = 'Interventions des 30 derniers jours';

    protected static ?int $sort = 3;

    protected function getData(): array
    {
        $data = [];
        $labels = [];

        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $labels[] = $date->format('d/m');
            
            $data[] = Mission::whereDate('scheduled_at', $date)->count();
        }

        return [
            'datasets' => [
                [
                    'label' => 'Interventions',
                    'data' => $data,
                    'fill' => true,
                    'backgroundColor' => 'rgba(14, 165, 233, 0.1)',
                    'borderColor' => 'rgb(14, 165, 233)',
                    'tension' => 0.3,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
