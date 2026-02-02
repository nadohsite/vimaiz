<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ServiceResource\Pages;
use App\Models\Service;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Schemas\Schema;
use UnitEnum;
use BackedEnum;

class ServiceResource extends Resource
{
    protected static ?string $model = Service::class;

    // Icône du menu
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-sparkles';
    
    // Groupe de navigation
    protected static string|UnitEnum|null $navigationGroup = 'Gestion des Services';

    protected static ?string $navigationLabel = 'Services';

    protected static ?string $modelLabel = 'Service';

    protected static ?string $pluralModelLabel = 'Services';

    protected static ?int $navigationSort = 98; // En bas du menu

    protected static bool $shouldRegisterNavigation = false; // Caché - non utilisé dans le flux actuel

    /**
     * Formulaire de création / édition
     */
    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\Select::make('category_id')
                    ->label('Catégorie')
                    ->relationship('category', 'name')
                    ->required(),
                Forms\Components\TextInput::make('name')
                    ->label('Nom')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Textarea::make('description')
                    ->label('Description')
                    ->maxLength(65535)
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('base_price')
                    ->label('Prix de base')
                    ->required()
                    ->numeric()
                    ->prefix('€'),
                Forms\Components\TextInput::make('estimated_duration_minutes')
                    ->label('Durée estimée')
                    ->required()
                    ->numeric()
                    ->suffix('minutes'),
                Forms\Components\Toggle::make('is_active')
                    ->label('Actif')
                    ->required(),
            ]);
    }

    /**
     * Table d'affichage des enregistrements
     */
    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('category.name')
                    ->label('Catégorie')
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->label('Nom')
                    ->searchable(),
                Tables\Columns\TextColumn::make('base_price')
                    ->label('Prix de base')
                    ->money('EUR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('estimated_duration_minutes')
                    ->label('Durée (min)')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Actif')
                    ->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category_id')
                    ->label('Catégorie')
                    ->relationship('category', 'name'),
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Actif'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Modifier'),
            ])
            ->bulkActions([]);
    }

    /**
     * Relations éventuelles
     */
    public static function getRelations(): array
    {
        return [];
    }

    /**
     * Pages de la ressource
     */
    public static function getPages(): array
    {
        return [
            'index' => Pages\ListServices::route('/'),
            'create' => Pages\CreateService::route('/create'),
            'edit' => Pages\EditService::route('/{record}/edit'),
        ];
    }
}
