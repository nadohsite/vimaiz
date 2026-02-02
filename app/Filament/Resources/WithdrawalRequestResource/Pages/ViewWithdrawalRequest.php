<?php

namespace App\Filament\Resources\WithdrawalRequestResource\Pages;

use App\Filament\Resources\WithdrawalRequestResource;
use Filament\Resources\Pages\ViewRecord;
use Filament\Actions\Action;
use Filament\Notifications\Notification;

class ViewWithdrawalRequest extends ViewRecord
{
    protected static string $resource = WithdrawalRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('approve')
                ->label('Valider le retrait')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('Valider le retrait')
                ->modalDescription('Confirmez-vous avoir effectué le virement bancaire à cet agent ?')
                ->modalSubmitActionLabel('Oui, valider')
                ->visible(fn () => $this->record->status === 'pending')
                ->action(function () {
                    $this->record->update([
                        'status' => 'completed',
                        'metadata' => array_merge($this->record->metadata ?? [], [
                            'approved_at' => now()->toISOString(),
                            'approved_by' => auth()->id(),
                        ]),
                    ]);
                    
                    Notification::make()
                        ->title('Retrait validé avec succès')
                        ->success()
                        ->send();
                    
                    $this->redirect(WithdrawalRequestResource::getUrl('index'));
                }),
            Action::make('reject')
                ->label('Rejeter')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->requiresConfirmation()
                ->modalHeading('Rejeter le retrait')
                ->modalDescription('Le montant sera remboursé au portefeuille de l\'agent.')
                ->modalSubmitActionLabel('Rejeter et rembourser')
                ->visible(fn () => $this->record->status === 'pending')
                ->action(function () {
                    // Rembourser le solde
                    $wallet = $this->record->wallet;
                    $wallet->balance += $this->record->amount;
                    $wallet->total_withdrawn -= $this->record->amount;
                    $wallet->save();
                    
                    $this->record->update([
                        'status' => 'rejected',
                        'metadata' => array_merge($this->record->metadata ?? [], [
                            'rejected_at' => now()->toISOString(),
                            'rejected_by' => auth()->id(),
                        ]),
                    ]);
                    
                    Notification::make()
                        ->title('Retrait rejeté et remboursé')
                        ->warning()
                        ->send();
                    
                    $this->redirect(WithdrawalRequestResource::getUrl('index'));
                }),
        ];
    }
}
