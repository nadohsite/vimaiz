<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BookingResource\Pages;
use App\Models\Booking;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Actions\ViewAction;
use Filament\Schemas\Schema;
use UnitEnum;
use BackedEnum;

class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;

    // Icône du menu
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-calendar';
    
    // Groupe de navigation
    protected static string|UnitEnum|null $navigationGroup = 'Gestion des Réservations';

    protected static ?string $navigationLabel = 'Réservations';

    protected static ?string $modelLabel = 'Réservation';

    protected static ?string $pluralModelLabel = 'Réservations';

    protected static ?int $navigationSort = 99; // En bas du menu

    protected static bool $shouldRegisterNavigation = false; // Caché par défaut - ancien système
   
    /**
     * Formulaire de création / édition
     */
    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\Select::make('client_id')
                    ->label('Client')
                    ->relationship('client', 'name')
                    ->required()
                    ->searchable(),
                Forms\Components\Select::make('agent_id')
                    ->label('Agent')
                    ->relationship('agent', 'name')
                    ->required()
                    ->searchable(),
                Forms\Components\Select::make('service_id')
                    ->label('Service')
                    ->relationship('service', 'name')
                    ->required(),
                Forms\Components\DateTimePicker::make('scheduled_at')
                    ->label('Date prévue')
                    ->required(),
                Forms\Components\TextInput::make('duration_minutes')
                    ->label('Durée (min)')
                    ->required()
                    ->numeric(),
                Forms\Components\TextInput::make('total_price')
                    ->label('Prix total')
                    ->required()
                    ->numeric()
                    ->prefix('€'),
                Forms\Components\Select::make('status')
                    ->label('Statut')
                    ->options([
                        'pending' => 'En attente',
                        'confirmed' => 'Confirmée',
                        'in_progress' => 'En cours',
                        'completed' => 'Terminée',
                        'cancelled' => 'Annulée',
                        'rejected' => 'Rejetée',
                    ])
                    ->required(),
                Forms\Components\Textarea::make('special_instructions')
                    ->label('Instructions spéciales')
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('cancellation_reason')
                    ->label('Raison d\'annulation')
                    ->columnSpanFull(),
            ]);
    }

    /**
     * Table d'affichage des enregistrements
     */
    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('booking_number')
                    ->label('N° Réservation')
                    ->searchable(),
                Tables\Columns\TextColumn::make('client.name')
                    ->label('Client')
                    ->searchable(),
                Tables\Columns\TextColumn::make('agent.name')
                    ->label('Agent')
                    ->searchable(),
                Tables\Columns\TextColumn::make('service.name')
                    ->label('Service')
                    ->sortable(),
                Tables\Columns\TextColumn::make('scheduled_at')
                    ->label('Date prévue')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'En attente',
                        'confirmed' => 'Confirmée',
                        'in_progress' => 'En cours',
                        'completed' => 'Terminée',
                        'cancelled' => 'Annulée',
                        'rejected' => 'Rejetée',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'confirmed' => 'info',
                        'in_progress' => 'primary',
                        'completed' => 'success',
                        'cancelled', 'rejected' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('total_price')
                    ->label('Prix')
                    ->money('EUR')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'pending' => 'En attente',
                        'confirmed' => 'Confirmée',
                        'in_progress' => 'En cours',
                        'completed' => 'Terminée',
                        'cancelled' => 'Annulée',
                        'rejected' => 'Rejetée',
                    ]),
            ])
            ->actions([
                ViewAction::make()->label('Voir'),
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
            'index' => Pages\ListBookings::route('/'),
            'create' => Pages\CreateBooking::route('/create'),
            'edit' => Pages\EditBooking::route('/{record}/edit'),
        ];
    }
}
