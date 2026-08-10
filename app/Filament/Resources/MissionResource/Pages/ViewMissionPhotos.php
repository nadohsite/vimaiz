<?php

namespace App\Filament\Resources\MissionResource\Pages;

use App\Filament\Resources\MissionResource;
use App\Models\Mission;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Storage;

class ViewMissionPhotos extends ViewRecord
{
    protected static string $resource = MissionResource::class;

    protected string $view = 'filament.resources.mission-resource.pages.view-mission-photos';

    protected function getHeaderActions(): array
    {
        return [];
    }

    public function getTitle(): string
    {
        return 'Photos - Intervention ' . $this->record->mission_number;
    }

    public function getBreadcrumb(): string
    {
        return 'Photos';
    }

    public function getBeforePhotos()
    {
        return $this->record->beforePhotos()->get();
    }

    public function getAfterPhotos()
    {
        return $this->record->afterPhotos()->get();
    }
}
