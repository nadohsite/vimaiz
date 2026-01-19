<?php

namespace App\Filament\Resources\MissionResource\Pages;

use App\Filament\Resources\MissionResource;
use Filament\Resources\Pages\Page;
use Illuminate\Support\Facades\Storage;

class ViewMissionPhotos extends Page
{
    protected static string $resource = MissionResource::class;

    protected string $view = 'filament.resources.mission-resource.pages.view-mission-photos';

    public $record;

    public function mount($record): void
    {
        $this->record = $this->resolveRecord($record);
    }

    public function getTitle(): string
    {
        return 'Photos - Mission ' . $this->record->mission_number;
    }

    public function getBreadcrumb(): string
    {
        return 'Photos';
    }

    public function getBeforePhotos()
    {
        return $this->record->beforePhotos;
    }

    public function getAfterPhotos()
    {
        return $this->record->afterPhotos;
    }
}
