<?php

namespace App\Filament\Resources\ReviewResource\Pages;

use App\Filament\Resources\ReviewResource;
use Filament\Resources\Pages\ViewRecord;
use Filament\Actions;

class ViewReview extends ViewRecord
{
    protected static string $resource = ReviewResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('approve')
                ->label('Approuver')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->visible(fn () => $this->record->status === 'pending')
                ->requiresConfirmation()
                ->action(function () {
                    $this->record->update([
                        'status' => 'approved',
                        'moderated_at' => now(),
                    ]);
                    $this->redirect(ReviewResource::getUrl('index'));
                }),
            Actions\Action::make('reject')
                ->label('Rejeter')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->visible(fn () => $this->record->status === 'pending')
                ->form([
                    \Filament\Forms\Components\Textarea::make('rejection_reason')
                        ->label('Raison du rejet')
                        ->required(),
                ])
                ->action(function (array $data) {
                    $this->record->update([
                        'status' => 'rejected',
                        'rejection_reason' => $data['rejection_reason'],
                        'moderated_at' => now(),
                    ]);
                    $this->redirect(ReviewResource::getUrl('index'));
                }),
        ];
    }
}
