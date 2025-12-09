<?php

namespace App\Filament\Resources\AgentPayoutResource\Pages;

use App\Filament\Resources\AgentPayoutResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAgentPayout extends EditRecord
{
    protected static string $resource = AgentPayoutResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
