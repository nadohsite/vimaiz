<?php

namespace App\Filament\Resources\AgentPayoutResource\Pages;

use App\Filament\Resources\AgentPayoutResource;
use Filament\Resources\Pages\ViewRecord;

class ViewAgentPayout extends ViewRecord
{
    protected static string $resource = AgentPayoutResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
