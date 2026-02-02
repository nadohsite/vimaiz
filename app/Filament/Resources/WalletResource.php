<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WalletResource\Pages;
use App\Models\Wallet;
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

class WalletResource extends Resource
{
    protected static ?string $model = Wallet::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-wallet';
    
    protected static string|UnitEnum|null $navigationGroup = 'Finances';

    protected static ?string $navigationLabel = 'Portefeuilles';

    protected static ?string $modelLabel = 'Portefeuille';

    protected static ?string $pluralModelLabel = 'Portefeuilles';

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Propriétaire')
                    ->schema([
                        TextEntry::make('user.name')
                            ->label('Utilisateur'),
                        TextEntry::make('user.email')
                            ->label('Email'),
                        TextEntry::make('user.role')
                            ->label('Rôle')
                            ->badge()
                            ->formatStateUsing(fn ($state) => match ($state) {
                                'client' => 'Client',
                                'agent' => 'Agent',
                                'admin' => 'Admin',
                                default => $state,
                            })
                            ->color(fn ($state) => match ($state) {
                                'client' => 'info',
                                'agent' => 'success',
                                'admin' => 'danger',
                                default => 'gray',
                            }),
                    ])->columns(3),
                Section::make('Soldes')
                    ->schema([
                        TextEntry::make('balance')
                            ->label('Solde disponible')
                            ->money('EUR')
                            ->color('success'),
                        TextEntry::make('pending_balance')
                            ->label('Solde en attente')
                            ->money('EUR')
                            ->color('warning'),
                    ])->columns(2),
                Section::make('Historique')
                    ->schema([
                        TextEntry::make('total_earned')
                            ->label('Total gagné')
                            ->money('EUR'),
                        TextEntry::make('total_withdrawn')
                            ->label('Total retiré')
                            ->money('EUR'),
                        TextEntry::make('updated_at')
                            ->label('Dernière mise à jour')
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
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Utilisateur')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('user.role')
                    ->label('Rôle')
                    ->badge()
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'client' => 'Client',
                        'agent' => 'Agent',
                        'admin' => 'Admin',
                        default => $state ?? '-',
                    })
                    ->color(fn (?string $state): string => match ($state) {
                        'client' => 'info',
                        'agent' => 'success',
                        'admin' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('balance')
                    ->label('Solde')
                    ->money('EUR')
                    ->sortable()
                    ->color('success'),
                Tables\Columns\TextColumn::make('pending_balance')
                    ->label('En attente')
                    ->money('EUR')
                    ->sortable()
                    ->color('warning'),
                Tables\Columns\TextColumn::make('total_earned')
                    ->label('Total gagné')
                    ->money('EUR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('total_withdrawn')
                    ->label('Total retiré')
                    ->money('EUR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Mis à jour')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('balance', 'desc')
            ->filters([
                //
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
        return false; // Les portefeuilles sont créés automatiquement à l'inscription
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWallets::route('/'),
            'view' => Pages\ViewWallet::route('/{record}'),
        ];
    }
}
