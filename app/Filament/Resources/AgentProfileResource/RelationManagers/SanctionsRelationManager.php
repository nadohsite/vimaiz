<?php

namespace App\Filament\Resources\AgentProfileResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class SanctionsRelationManager extends RelationManager
{
    protected static string $relationship = 'sanctions';

    protected static ?string $title = 'Historique des sanctions';

    protected static ?string $recordTitleAttribute = 'type';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Date')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'warning' => 'Avertissement',
                        'suspension' => 'Suspension',
                        'ban' => 'Exclusion',
                        'unsuspend' => 'Levée suspension',
                        'unban' => 'Réintégration',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'warning' => 'warning',
                        'suspension' => 'danger',
                        'ban' => 'danger',
                        'unsuspend' => 'success',
                        'unban' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('reason')
                    ->label('Raison')
                    ->limit(50)
                    ->tooltip(fn ($record) => $record->reason),
                Tables\Columns\TextColumn::make('suspension_days')
                    ->label('Durée')
                    ->suffix(' jours')
                    ->placeholder('-'),
                Tables\Columns\TextColumn::make('expires_at')
                    ->label('Expire le')
                    ->dateTime('d/m/Y')
                    ->placeholder('-'),
                Tables\Columns\TextColumn::make('admin.name')
                    ->label('Par')
                    ->placeholder('Système'),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Type')
                    ->options([
                        'warning' => 'Avertissement',
                        'suspension' => 'Suspension',
                        'ban' => 'Exclusion',
                        'unsuspend' => 'Levée suspension',
                    ]),
            ])
            ->headerActions([])
            ->actions([])
            ->bulkActions([]);
    }
}
