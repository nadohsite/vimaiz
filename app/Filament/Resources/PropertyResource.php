<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PropertyResource\Pages;
use App\Models\Property;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Schemas\Schema;
use UnitEnum;
use BackedEnum;

class PropertyResource extends Resource
{
    protected static ?string $model = Property::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-home-modern';
    
    protected static string|UnitEnum|null $navigationGroup = 'Clients';

    protected static ?string $navigationLabel = 'Logements';

    protected static ?string $modelLabel = 'Logement';

    protected static ?string $pluralModelLabel = 'Logements';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\Section::make('Propriétaire')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->label('Client')
                            ->relationship('user', 'name', fn ($query) => $query->where('role', 'client'))
                            ->searchable()
                            ->preload()
                            ->required(),
                    ]),

                Forms\Components\Section::make('Type & Localisation')
                    ->schema([
                        Forms\Components\Select::make('type')
                            ->label('Type de logement')
                            ->options([
                                'maison' => 'Maison',
                                'villa' => 'Villa',
                                'chalet' => 'Chalet',
                            ])
                            ->required(),
                        Forms\Components\TextInput::make('name')
                            ->label('Nom du logement')
                            ->placeholder('Ma résidence principale'),
                        Forms\Components\TextInput::make('address_line1')
                            ->label('Adresse')
                            ->required(),
                        Forms\Components\TextInput::make('address_line2')
                            ->label('Complément d\'adresse'),
                        Forms\Components\TextInput::make('city')
                            ->label('Ville')
                            ->required(),
                        Forms\Components\TextInput::make('postal_code')
                            ->label('Code postal')
                            ->required(),
                    ])->columns(2),

                Forms\Components\Section::make('Caractéristiques')
                    ->schema([
                        Forms\Components\TextInput::make('surface_area')
                            ->label('Surface')
                            ->numeric()
                            ->suffix('m²')
                            ->required(),
                        Forms\Components\TextInput::make('bedrooms')
                            ->label('Chambres')
                            ->numeric()
                            ->default(0),
                        Forms\Components\TextInput::make('bathrooms')
                            ->label('Salles de bain')
                            ->numeric()
                            ->default(0),
                        Forms\Components\TextInput::make('toilets')
                            ->label('Toilettes')
                            ->numeric()
                            ->default(0),
                        Forms\Components\TextInput::make('other_rooms')
                            ->label('Autres pièces')
                            ->numeric()
                            ->default(0),
                        Forms\Components\TextInput::make('floors')
                            ->label('Étages')
                            ->numeric()
                            ->default(0)
                            ->helperText('0 = Plain-pied'),
                        Forms\Components\TextInput::make('external_surface')
                            ->label('Surface extérieure')
                            ->numeric()
                            ->suffix('m²'),
                    ])->columns(3),

                Forms\Components\Section::make('Accès & Instructions')
                    ->schema([
                        Forms\Components\TextInput::make('access_code')
                            ->label('Code d\'accès'),
                        Forms\Components\Textarea::make('entry_instructions')
                            ->label('Instructions d\'entrée')
                            ->rows(2),
                        Forms\Components\TextInput::make('wifi_code')
                            ->label('Code WiFi'),
                        Forms\Components\Textarea::make('trash_instructions')
                            ->label('Instructions poubelles')
                            ->rows(2),
                        Forms\Components\Textarea::make('additional_info')
                            ->label('Informations complémentaires')
                            ->rows(3)
                            ->columnSpanFull(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Client')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'maison' => 'info',
                        'villa' => 'success',
                        'chalet' => 'warning',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => ucfirst($state)),
                Tables\Columns\TextColumn::make('name')
                    ->label('Nom')
                    ->searchable()
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('city')
                    ->label('Ville')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('postal_code')
                    ->label('CP')
                    ->searchable(),
                Tables\Columns\TextColumn::make('surface_area')
                    ->label('Surface')
                    ->suffix(' m²')
                    ->sortable(),
                Tables\Columns\TextColumn::make('bedrooms')
                    ->label('Ch.')
                    ->alignCenter(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créé le')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Type')
                    ->options([
                        'maison' => 'Maison',
                        'villa' => 'Villa',
                        'chalet' => 'Chalet',
                    ]),
                Tables\Filters\SelectFilter::make('user_id')
                    ->label('Client')
                    ->relationship('user', 'name', fn ($query) => $query->where('role', 'client'))
                    ->searchable()
                    ->preload(),
            ])
            ->actions([
                Tables\Actions\Action::make('suspend')
                    ->label('Suspendre')
                    ->icon('heroicon-o-pause-circle')
                    ->color('warning')
                    ->visible(fn ($record) => $record->is_active ?? true)
                    ->requiresConfirmation()
                    ->modalHeading('Suspendre ce logement')
                    ->modalDescription('Ce logement ne sera plus disponible pour de nouvelles demandes.')
                    ->action(fn ($record) => $record->update(['is_active' => false])),
                Tables\Actions\Action::make('activate')
                    ->label('Réactiver')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => !($record->is_active ?? true))
                    ->requiresConfirmation()
                    ->action(fn ($record) => $record->update(['is_active' => true])),
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProperties::route('/'),
            'create' => Pages\CreateProperty::route('/create'),
            'view' => Pages\ViewProperty::route('/{record}'),
            'edit' => Pages\EditProperty::route('/{record}/edit'),
        ];
    }
}
