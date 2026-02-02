<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ServiceCategoryResource\Pages;
use App\Models\ServiceCategory;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Schemas\Schema;
use UnitEnum;
use BackedEnum;

class ServiceCategoryResource extends Resource
{
    protected static ?string $model = ServiceCategory::class;

    // Icône du menu
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-tag';
    
    // Groupe de navigation
    protected static string|UnitEnum|null $navigationGroup = 'Gestion des Services';

    protected static ?string $navigationLabel = 'Catégories de services';

    protected static ?string $modelLabel = 'Catégorie de service';

    protected static ?string $pluralModelLabel = 'Catégories de services';

    protected static ?int $navigationSort = 97;

    protected static bool $shouldRegisterNavigation = false; // Caché - non utilisé dans le flux actuel

    /**
     * Formulaire de création / édition
     */
    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Nom')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Textarea::make('description')
                    ->label('Description')
                    ->maxLength(65535)
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('sort_order')
                    ->label('Ordre d\'affichage')
                    ->required()
                    ->numeric()
                    ->default(0),
                Forms\Components\Toggle::make('is_active')
                    ->label('Active')
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
                Tables\Columns\TextColumn::make('name')
                    ->label('Nom')
                    ->searchable(),
                Tables\Columns\TextColumn::make('description')
                    ->label('Description')
                    ->limit(50),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('Ordre')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean(),
            ])
            ->defaultSort('sort_order')
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active'),
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
            'index' => Pages\ListServiceCategories::route('/'),
            'create' => Pages\CreateServiceCategory::route('/create'),
            'edit' => Pages\EditServiceCategory::route('/{record}/edit'),
        ];
    }
}
