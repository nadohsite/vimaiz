<?php

namespace App\Filament\Resources\ContactMessageResource\Pages;

use App\Filament\Resources\ContactMessageResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewContactMessage extends ViewRecord
{
    protected static string $resource = ContactMessageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
            Actions\Action::make('reply')
                ->label('Répondre par email')
                ->icon('heroicon-o-paper-airplane')
                ->color('success')
                ->url(fn () => "mailto:{$this->record->email}?subject=Re: {$this->record->subject}")
                ->openUrlInNewTab(),
        ];
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        // Marquer comme lu automatiquement quand on visualise
        $this->record->markAsRead();
        
        return $data;
    }
}
