<?php

namespace App\Filament\Resources\AgentProfileResource\Pages;

use App\Filament\Resources\AgentProfileResource;
use App\Notifications\DocumentsRejectedNotification;
use App\Notifications\DocumentsVerifiedNotification;
use Filament\Actions;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewAgentProfile extends ViewRecord
{
    protected static string $resource = AgentProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('view_documents')
                ->label('Voir les documents')
                ->icon('heroicon-o-document-text')
                ->color('info')
                ->url(fn () => AgentProfileResource::getUrl('documents', ['record' => $this->record])),
            Action::make('verify')
                ->label('Valider les documents')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->visible(fn () => in_array($this->record->verification_status, ['pending', 'submitted']))
                ->requiresConfirmation()
                ->modalHeading('Valider les documents')
                ->modalDescription('Confirmez que tous les documents de cet intervenant sont valides.')
                ->action(function () {
                    $this->record->update([
                        'verification_status' => 'verified',
                        'rejection_reason' => null,
                        'verified_at' => now(),
                    ]);

                    if ($this->record->user) {
                        $this->record->user->notifyNow(new DocumentsVerifiedNotification);
                    }

                    Notification::make()
                        ->title('Documents validés')
                        ->body('L\'intervenant a été notifié par email.')
                        ->success()
                        ->send();
                }),
            Action::make('reject')
                ->label('Rejeter les documents')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->visible(fn () => in_array($this->record->verification_status, ['pending', 'submitted']))
                ->form([
                    Forms\Components\Textarea::make('rejection_reason')
                        ->label('Raison du rejet')
                        ->required()
                        ->placeholder('Expliquez pourquoi les documents sont rejetés...'),
                ])
                ->action(function (array $data) {
                    $this->record->update([
                        'verification_status' => 'rejected',
                        'rejection_reason' => $data['rejection_reason'],
                    ]);

                    if ($this->record->user) {
                        $this->record->user->notifyNow(new DocumentsRejectedNotification($data['rejection_reason']));
                    }

                    Notification::make()
                        ->title('Documents rejetés')
                        ->body('L\'intervenant a été notifié par email.')
                        ->warning()
                        ->send();
                }),
            Actions\EditAction::make(),
        ];
    }
}
