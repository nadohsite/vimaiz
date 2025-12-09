<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WalletResource\Pages;
use App\Models\Wallet;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

use UnitEnum;
use BackedEnum;

class WalletResource extends Resource
{
    protected static ?string $model = Wallet::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-wallet';
    
    protected static string|UnitEnum|null $navigationGroup = 'Finance';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                Forms\Components\TextInput::make('balance')
                    ->numeric()
                    ->prefix('MAD')
                    ->required(),
                Forms\Components\TextInput::make('pending_balance')
                    ->numeric()
                    ->prefix('MAD')
                    ->required(),
                Forms\Components\TextInput::make('total_earned')
                    ->numeric()
                    ->prefix('MAD')
                    ->required(),
                Forms\Components\TextInput::make('total_withdrawn')
                    ->numeric()
                    ->prefix('MAD')
                    ->required(),
                Forms\Components\TextInput::make('currency')
                    ->default('MAD')
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('balance')
                    ->money('MAD')
                    ->sortable(),
                Tables\Columns\TextColumn::make('pending_balance')
                    ->money('MAD')
                    ->sortable(),
                Tables\Columns\TextColumn::make('total_earned')
                    ->money('MAD')
                    ->sortable(),
                Tables\Columns\TextColumn::make('total_withdrawn')
                    ->money('MAD')
                    ->sortable(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                // Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                // Tables\Actions\BulkActionGroup::make([
                //     Tables\Actions\DeleteBulkAction::make(),
                // ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWallets::route('/'),
            'create' => Pages\CreateWallet::route('/create'),
            'edit' => Pages\EditWallet::route('/{record}/edit'),
        ];
    }
}
