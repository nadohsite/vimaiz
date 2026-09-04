<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ServiceRequestResource\Pages;
use App\Models\Property;
use App\Models\ServiceRequest;
use App\Support\ScheduledTime;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use UnitEnum;

class ServiceRequestResource extends Resource
{
    protected static ?string $model = ServiceRequest::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static string|UnitEnum|null $navigationGroup = 'Demandes & Interventions';

    protected static ?string $navigationLabel = "Demandes d'intervention";

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
                            ->getOptionLabelFromRecordUsing(fn ($record) => $record->name ?? $record->email ?? "Client #{$record->id}")
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('property_id')
                            ->label('Bien')
                            ->relationship('property', 'name')
                            ->getOptionLabelFromRecordUsing(fn ($record) => $record->name ?? "Bien #{$record->id}")
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
                            ->seconds(false)
                            ->required(),
                        Forms\Components\TextInput::make('requested_hours')
                            ->label('Heures demandées')
                            ->numeric()
                            ->minValue(1)
                            ->suffix('heures')
                            ->placeholder('Non spécifié'),
                    ])->columns(3),

                Section::make('Détails')
                    ->schema([
                        Forms\Components\Textarea::make('special_instructions')
                            ->label('Instructions particulières')
                            ->rows(3)
                            ->columnSpanFull(),
                        Forms\Components\Placeholder::make('checklist_axes')
                            ->label('Axes d\'intervention')
                            ->content(function (?ServiceRequest $record): string {
                                if (! $record || empty($record->checklist)) {
                                    return 'Aucun axe sélectionné';
                                }

                                $lines = [];
                                foreach ($record->checklist as $section) {
                                    $title = trim(($section['emoji'] ?? '').' '.($section['title'] ?? 'Section'));
                                    $itemCount = count($section['items'] ?? []);
                                    $lines[] = "{$title} ({$itemCount} tâche".($itemCount > 1 ? 's' : '').')';
                                    foreach ($section['items'] ?? [] as $item) {
                                        $lines[] = '  • '.($item['label'] ?? '');
                                    }
                                }

                                return implode("\n", $lines);
                            })
                            ->columnSpanFull(),
                        Forms\Components\Select::make('status')
                            ->label('Statut')
                            ->options([
                                'pending' => 'En attente de devis',
                                'quote_sent' => 'Devis envoyé',
                                'quote_accepted' => 'Devis accepté',
                                'quote_refused' => 'Devis refusé',
                                'paid' => 'Payé',
                                'assigned' => 'Intervenant attribué',
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
                        'appartement' => 'gray',
                        'maison' => 'info',
                        'villa' => 'success',
                        'chalet' => 'warning',
                        'gite' => 'primary',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => Property::TYPES[$state] ?? ucfirst($state)),
                Tables\Columns\TextColumn::make('property.city')
                    ->label('Ville')
                    ->searchable(),
                Tables\Columns\TextColumn::make('scheduled_date')
                    ->label('Date')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('scheduled_time')
                    ->label('Heure')
                    ->formatStateUsing(fn ($state) => ScheduledTime::toHi($state) ?? '—'),
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
                        'assigned' => 'Intervenant attribué',
                        'in_progress' => 'En cours',
                        'completed' => 'Terminée',
                        'cancelled' => 'Annulée',
                    ]),
                Tables\Filters\SelectFilter::make('property.type')
                    ->label('Type de bien')
                    ->options(Property::TYPES),
            ])
            ->actions([
                Action::make('create_quote')
                    ->label('Créer devis')
                    ->icon('heroicon-o-document-text')
                    ->color('success')
                    ->visible(fn ($record) => $record->status === 'pending' && ! $record->quote)
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
