<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AgentPayoutResource\Pages;
use App\Models\AgentPayout;
use BackedEnum;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Actions\ViewAction;
use Filament\Schemas\Components\Section;
use Filament\Infolists\Components\TextEntry;
use UnitEnum;

class AgentPayoutResource extends Resource
{
    protected static ?string $model = AgentPayout::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-banknotes';

    protected static string|UnitEnum|null $navigationGroup = 'Finances';

    protected static ?string $navigationLabel = 'Paiements intervenants';

    protected static ?string $modelLabel = 'Paiement intervenant';

    protected static ?string $pluralModelLabel = 'Paiements intervenants';

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Informations du paiement')
                    ->schema([
                        TextEntry::make('payout_number')
                            ->label('N° Paiement'),
                        TextEntry::make('agent.name')
                            ->label('Intervenant'),
                        TextEntry::make('status')
                            ->label('Statut')
                            ->badge()
                            ->formatStateUsing(fn ($state) => match ($state) {
                                'pending' => 'En attente',
                                'processing' => 'En cours',
                                'completed' => 'Terminé',
                                'failed' => 'Échoué',
                                default => $state,
                            })
                            ->color(fn ($state) => match ($state) {
                                'pending' => 'warning',
                                'processing' => 'info',
                                'completed' => 'success',
                                'failed' => 'danger',
                                default => 'gray',
                            }),
                    ])->columns(3),
                Section::make('Période')
                    ->schema([
                        TextEntry::make('period_start')
                            ->label('Début')
                            ->date('d/m/Y'),
                        TextEntry::make('period_end')
                            ->label('Fin')
                            ->date('d/m/Y'),
                    ])->columns(2),
                Section::make('Montants')
                    ->schema([
                        TextEntry::make('gross_amount')
                            ->label('Montant brut')
                            ->money('EUR'),
                        TextEntry::make('platform_commission')
                            ->label('Commission plateforme')
                            ->money('EUR'),
                        TextEntry::make('net_amount')
                            ->label('Montant net versé')
                            ->money('EUR')
                            ->weight('bold'),
                    ])->columns(3),
                Section::make('Traitement')
                    ->schema([
                        TextEntry::make('processed_at')
                            ->label('Traité le')
                            ->dateTime('d/m/Y H:i'),
                        TextEntry::make('failure_reason')
                            ->label('Raison de l\'échec')
                            ->visible(fn ($record) => $record->status === 'failed'),
                    ]),
            ]);
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('payout_number')
                    ->label('N° Paiement')
                    ->searchable(),
                Tables\Columns\TextColumn::make('agent.name')
                    ->label('Intervenant')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('period_start')
                    ->label('Début')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('period_end')
                    ->label('Fin')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('gross_amount')
                    ->label('Brut')
                    ->money('EUR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('platform_commission')
                    ->label('Commission')
                    ->money('EUR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('net_amount')
                    ->label('Net')
                    ->money('EUR')
                    ->sortable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'En attente',
                        'processing' => 'En cours',
                        'completed' => 'Terminé',
                        'failed' => 'Échoué',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'processing' => 'info',
                        'completed' => 'success',
                        'failed' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('processed_at')
                    ->label('Traité le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'pending' => 'En attente',
                        'processing' => 'En cours',
                        'completed' => 'Terminé',
                        'failed' => 'Échoué',
                    ]),
            ])
            ->actions([
                ViewAction::make()->label('Voir'),
            ])
            ->bulkActions([]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function canCreate(): bool
    {
        return false; // Les paiements sont générés automatiquement
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAgentPayouts::route('/'),
            'view' => Pages\ViewAgentPayout::route('/{record}'),
        ];
    }
}
