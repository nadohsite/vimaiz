<?php

namespace App\Filament\Resources\ServiceRequestResource\Pages;

use App\Filament\Resources\ServiceRequestResource;
use App\Filament\Resources\QuoteResource;
use App\Filament\Resources\MissionResource;
use App\Models\Quote;
use App\Services\MissionService;
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

            Actions\Action::make('create_mission')
                ->label('Confirmer paiement & créer mission')
                ->icon('heroicon-o-briefcase')
                ->color('success')
                ->visible(fn () => $this->record->quote
                    && in_array($this->record->quote->status, [Quote::STATUS_ACCEPTED, Quote::STATUS_PAID], true)
                    && ! $this->record->mission)
                ->requiresConfirmation()
                ->modalHeading('Créer la mission')
                ->modalDescription('Confirme le paiement et crée la mission à partir du devis accepté.')
                ->action(function (MissionService $missionService) {
                    try {
                        $mission = $missionService->createPaidMissionFromQuote(
                            $this->record->quote,
                            'admin-manual-' . uniqid(),
                        );

                        Notification::make()
                            ->title('Mission créée')
                            ->body("Mission {$mission->mission_number} créée.")
                            ->success()
                            ->send();

                        $this->redirect(MissionResource::getUrl('view', ['record' => $mission]));
                    } catch (\Throwable $e) {
                        Notification::make()
                            ->title('Impossible de créer la mission')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                }),

            Actions\Action::make('view_mission')
                ->label('Voir la mission')
                ->icon('heroicon-o-briefcase')
                ->color('info')
                ->visible(fn () => $this->record->mission !== null)
                ->url(fn () => MissionResource::getUrl('view', ['record' => $this->record->mission])),

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
