<?php

namespace App\Filament\Resources\MissionResource\Pages;

use App\Filament\Resources\MissionResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewMission extends ViewRecord
{
    protected static string $resource = MissionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
            Actions\Action::make('view_photos')
                ->label('Voir les photos')
                ->icon('heroicon-o-camera')
                ->url(fn () => MissionResource::getUrl('photos', ['record' => $this->record])),
        ];
    }
}
