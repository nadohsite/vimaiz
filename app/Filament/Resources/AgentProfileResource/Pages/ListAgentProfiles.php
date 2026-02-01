<?php

namespace App\Filament\Resources\AgentProfileResource\Pages;

use App\Filament\Resources\AgentProfileResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAgentProfiles extends ListRecords
{
    protected static string $resource = AgentProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
