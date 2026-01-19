<?php

namespace App\Filament\Resources\ServiceRequestResource\Pages;

use App\Filament\Resources\ServiceRequestResource;
use App\Filament\Resources\QuoteResource;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewServiceRequest extends ViewRecord
{
    protected static string $resource = ServiceRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('create_quote')
                ->label('Créer un devis')
                ->icon('heroicon-o-document-text')
                ->color('success')
                ->visible(fn () => $this->record->status === 'pending' && !$this->record->quote)
                ->url(fn () => QuoteResource::getUrl('create', ['service_request_id' => $this->record->id])),

            Actions\Action::make('view_quote')
                ->label('Voir le devis')
                ->icon('heroicon-o-document-text')
                ->color('info')
                ->visible(fn () => $this->record->quote !== null)
                ->url(fn () => QuoteResource::getUrl('view', ['record' => $this->record->quote])),

            Actions\Action::make('cancel')
                ->label('Annuler la demande')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->visible(fn () => in_array($this->record->status, ['pending', 'quote_sent']))
                ->requiresConfirmation()
                ->modalHeading('Annuler cette demande ?')
                ->modalDescription('Cette action est irréversible.')
                ->action(function () {
                    $this->record->update([
                        'status' => 'cancelled',
                        'cancellation_reason' => 'Annulée par l\'admin',
                        'cancelled_at' => now(),
                    ]);
                    Notification::make()
                        ->title('Demande annulée')
                        ->success()
                        ->send();
                }),

            Actions\EditAction::make(),
        ];
    }
}
