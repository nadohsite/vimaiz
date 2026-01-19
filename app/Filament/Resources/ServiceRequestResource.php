<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ServiceRequestResource\Pages;
use App\Models\ServiceRequest;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Actions\Action;
use Filament\Actions\ViewAction;
use Filament\Actions\EditAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use UnitEnum;
use BackedEnum;

class ServiceRequestResource extends Resource
{
    protected static ?string $model = ServiceRequest::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-clipboard-document-list';
    
    protected static string|UnitEnum|null $navigationGroup = 'Demandes & Missions';

    protected static ?string $navigationLabel = 'Demandes de ménage';

    protected static ?string $modelLabel = 'Demande';

    protected static ?string $pluralModelLabel = 'Demandes';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Informations de la demande')
                    ->schema([
                        Forms\Components\TextInput::make('request_number')
                            ->label('N° Demande')
                            ->disabled()
                            ->dehydrated(false),
                        Forms\Components\Select::make('client_id')
                            ->label('Client')
                            ->relationship('client', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('property_id')
                            ->label('Logement')
                            ->relationship('property', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                    ])->columns(3),

                Section::make('Planification')
                    ->schema([
                        Forms\Components\DatePicker::make('scheduled_date')
                            ->label('Date prévue')
                            ->required(),
                        Forms\Components\TimePicker::make('scheduled_time')
                            ->label('Heure prévue')
                            ->required(),
                        Forms\Components\TextInput::make('requested_hours')
                            ->label('Heures demandées')
                            ->numeric()
                            ->required()
                            ->minValue(2)
                            ->suffix('heures'),
                    ])->columns(3),

                Section::make('Détails')
                    ->schema([
                        Forms\Components\Textarea::make('special_instructions')
                            ->label('Instructions particulières')
                            ->rows(3)
                            ->columnSpanFull(),
                        Forms\Components\Select::make('status')
                            ->label('Statut')
                            ->options([
                                'pending' => 'En attente de devis',
                                'quote_sent' => 'Devis envoyé',
                                'quote_accepted' => 'Devis accepté',
                                'quote_refused' => 'Devis refusé',
                                'paid' => 'Payé',
                                'assigned' => 'Agent attribué',
                                'in_progress' => 'En cours',
                                'completed' => 'Terminée',
                                'cancelled' => 'Annulée',
                            ])
                            ->required(),
                    ]),

                Section::make('Annulation')
                    ->schema([
                        Forms\Components\Textarea::make('cancellation_reason')
                            ->label('Raison d\'annulation')
                            ->rows(2),
                        Forms\Components\DateTimePicker::make('cancelled_at')
                            ->label('Date d\'annulation'),
                    ])
                    ->collapsed()
                    ->visible(fn ($record) => $record?->status === 'cancelled'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('request_number')
                    ->label('N° Demande')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('client.name')
                    ->label('Client')
                    ->searchable()
                    ->sortable(),
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
                    ->label('Ville')
                    ->searchable(),
                Tables\Columns\TextColumn::make('scheduled_date')
                    ->label('Date')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('scheduled_time')
                    ->label('Heure')
                    ->time('H:i'),
                Tables\Columns\TextColumn::make('requested_hours')
                    ->label('Heures')
                    ->suffix('h'),
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
                        'quote_accepted' => 'Devis accepté',
                        'quote_refused' => 'Devis refusé',
                        'paid' => 'Payé',
                        'assigned' => 'Attribué',
                        'in_progress' => 'En cours',
                        'completed' => 'Terminée',
                        'cancelled' => 'Annulée',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créée le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'pending' => 'En attente de devis',
                        'quote_sent' => 'Devis envoyé',
                        'quote_accepted' => 'Devis accepté',
                        'quote_refused' => 'Devis refusé',
                        'paid' => 'Payé',
                        'assigned' => 'Agent attribué',
                        'in_progress' => 'En cours',
                        'completed' => 'Terminée',
                        'cancelled' => 'Annulée',
                    ]),
                Tables\Filters\SelectFilter::make('property.type')
                    ->label('Type de logement')
                    ->options([
                        'maison' => 'Maison',
                        'villa' => 'Villa',
                        'chalet' => 'Chalet',
                    ]),
            ])
            ->actions([
                Action::make('create_quote')
                    ->label('Créer devis')
                    ->icon('heroicon-o-document-text')
                    ->color('success')
                    ->visible(fn ($record) => $record->status === 'pending' && !$record->quote)
                    ->url(fn ($record) => QuoteResource::getUrl('create', ['service_request_id' => $record->id])),
                ViewAction::make(),
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
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
            'index' => Pages\ListServiceRequests::route('/'),
            'create' => Pages\CreateServiceRequest::route('/create'),
            'view' => Pages\ViewServiceRequest::route('/{record}'),
            'edit' => Pages\EditServiceRequest::route('/{record}/edit'),
        ];
    }
}
