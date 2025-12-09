<?php

namespace App\Filament\Resources\AgentPayoutResource\Pages;

use App\Filament\Resources\AgentPayoutResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAgentPayouts extends ListRecords
{
    protected static string $resource = AgentPayoutResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
