<?php

namespace App\Filament\Resources\AgentProfileResource\Pages;

use App\Filament\Resources\AgentProfileResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAgentProfile extends EditRecord
{
    protected static string $resource = AgentProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
        ];
    }
}
