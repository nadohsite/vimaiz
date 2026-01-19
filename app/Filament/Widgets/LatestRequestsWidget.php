<?php

namespace App\Filament\Widgets;

use App\Models\ServiceRequest;
use App\Filament\Resources\ServiceRequestResource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Actions\Action;
use Filament\Widgets\TableWidget as BaseWidget;

class LatestRequestsWidget extends BaseWidget
{
    protected static ?int $sort = 2;

    protected int | string | array $columnSpan = 'full';

    protected static ?string $heading = 'Dernières demandes de ménage';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                ServiceRequest::query()
                    ->with(['client', 'property'])
                    ->latest()
                    ->limit(5)
            )
            ->columns([
                Tables\Columns\TextColumn::make('request_number')
                    ->label('N° Demande')
                    ->searchable(),
                Tables\Columns\TextColumn::make('client.name')
                    ->label('Client'),
                Tables\Columns\TextColumn::make('property.type')
                    ->label('Type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'maison' => 'info',
                        'villa' => 'success',
                        'chalet' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('property.city')
                    ->label('Ville'),
                Tables\Columns\TextColumn::make('scheduled_date')
                    ->label('Date')
                    ->date('d/m/Y'),
                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'quote_sent' => 'info',
                        'quote_accepted' => 'success',
                        'quote_refused' => 'danger',
                        'paid' => 'success',
                        'assigned' => 'info',
                        'in_progress' => 'primary',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'En attente',
                        'quote_sent' => 'Devis envoyé',
                        'quote_accepted' => 'Accepté',
                        'quote_refused' => 'Refusé',
                        'paid' => 'Payé',
                        'assigned' => 'Attribué',
                        'in_progress' => 'En cours',
                        'completed' => 'Terminée',
                        'cancelled' => 'Annulée',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créée')
                    ->since(),
            ])
            ->actions([
                Action::make('view')
                    ->label('Voir')
                    ->icon('heroicon-o-eye')
                    ->url(fn ($record) => ServiceRequestResource::getUrl('view', ['record' => $record])),
            ])
            ->paginated(false);
    }
}
