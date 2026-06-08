<?php

namespace App\Filament\Resources\QuoteResource\Pages;

use App\Filament\Resources\MissionResource;
use App\Filament\Resources\QuoteResource;
use App\Models\Quote;
use App\Services\MissionService;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewQuote extends ViewRecord
{
    protected static string $resource = QuoteResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('create_mission')
                ->label('Confirmer paiement & créer mission')
                ->icon('heroicon-o-briefcase')
                ->color('success')
                ->visible(fn () => $this->canCreateMissionFromQuote())
                ->requiresConfirmation()
                ->modalHeading('Créer la mission')
                ->modalDescription('Confirme le paiement et crée la mission. Elle sera proposée aux agents éligibles.')
                ->action(function (MissionService $missionService) {
                    try {
                        $mission = $missionService->createPaidMissionFromQuote(
                            $this->record,
                            'admin-manual-' . uniqid(),
                        );

                        Notification::make()
                            ->title('Mission créée')
                            ->body("Mission {$mission->mission_number} créée et proposée aux agents.")
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

            Actions\EditAction::make(),
        ];
    }

    protected function canCreateMissionFromQuote(): bool
    {
        /** @var Quote $quote */
        $quote = $this->record;

        return in_array($quote->status, [Quote::STATUS_ACCEPTED, Quote::STATUS_PAID], true)
            && ! $quote->mission;
    }
}
