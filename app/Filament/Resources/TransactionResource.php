<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TransactionResource\Pages;
use App\Models\Transaction;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Actions\ViewAction;
use Filament\Schemas\Components\Section;
use Filament\Infolists\Components\TextEntry;
use UnitEnum;
use BackedEnum;

class TransactionResource extends Resource
{
    protected static ?string $model = Transaction::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-currency-dollar';
    
    protected static string|UnitEnum|null $navigationGroup = 'Finances';

    protected static ?string $navigationLabel = 'Transactions';

    protected static ?string $modelLabel = 'Transaction';

    protected static ?string $pluralModelLabel = 'Transactions';

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Détails de la transaction')
                    ->schema([
                        TextEntry::make('transaction_number')
                            ->label('N° Transaction'),
                        TextEntry::make('user.name')
                            ->label('Utilisateur'),
                        TextEntry::make('type')
                            ->label('Type')
                            ->badge()
                            ->formatStateUsing(fn ($state) => match ($state) {
                                'payment' => 'Paiement',
                                'payout' => 'Versement',
                                'refund' => 'Remboursement',
                                default => $state,
                            })
                            ->color(fn ($state) => match ($state) {
                                'payment' => 'success',
                                'payout' => 'info',
                                'refund' => 'danger',
                                default => 'gray',
                            }),
                        TextEntry::make('amount')
                            ->label('Montant')
                            ->money('EUR'),
                        TextEntry::make('status')
                            ->label('Statut')
                            ->badge()
                            ->formatStateUsing(fn ($state) => match ($state) {
                                'pending' => 'En attente',
                                'completed' => 'Terminé',
                                'failed' => 'Échoué',
                                default => $state,
                            })
                            ->color(fn ($state) => match ($state) {
                                'pending' => 'warning',
                                'completed' => 'success',
                                'failed' => 'danger',
                                default => 'gray',
                            }),
                        TextEntry::make('created_at')
                            ->label('Date')
                            ->dateTime('d/m/Y H:i'),
                    ])->columns(3),
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
                Tables\Columns\TextColumn::make('transaction_number')
                    ->label('N° Transaction')
                    ->searchable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Utilisateur')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'payment' => 'Paiement',
                        'payout' => 'Versement',
                        'refund' => 'Remboursement',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'payment' => 'success',
                        'payout' => 'info',
                        'refund' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Montant')
                    ->money('EUR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'En attente',
                        'completed' => 'Terminé',
                        'failed' => 'Échoué',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'completed' => 'success',
                        'failed' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Date')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Type')
                    ->options([
                        'payment' => 'Paiement',
                        'payout' => 'Versement',
                        'refund' => 'Remboursement',
                    ]),
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'pending' => 'En attente',
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
        return false; // Les transactions sont générées automatiquement
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTransactions::route('/'),
            'view' => Pages\ViewTransaction::route('/{record}'),
        ];
    }
}
