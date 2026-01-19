<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewUser extends ViewRecord
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('activate')
                ->label('Activer')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->visible(fn () => !$this->record->is_active)
                ->requiresConfirmation()
                ->action(fn () => $this->record->update(['is_active' => true])),
            Actions\Action::make('suspend')
                ->label('Suspendre')
                ->icon('heroicon-o-pause-circle')
                ->color('warning')
                ->visible(fn () => $this->record->is_active && $this->record->role !== 'admin')
                ->requiresConfirmation()
                ->action(fn () => $this->record->update(['is_active' => false])),
            Actions\EditAction::make(),
            Actions\DeleteAction::make()
                ->visible(fn () => $this->record->role !== 'admin'),
        ];
    }
}
