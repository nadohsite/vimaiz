<?php

namespace App\Filament\Resources;

use App\Filament\Resources\QuoteResource\Pages;
use App\Models\Quote;
use App\Models\ServiceRequest;
use App\Models\PricingRule;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Notifications\Notification;
use Filament\Actions\Action;
use Filament\Actions\ViewAction;
use Filament\Actions\EditAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use UnitEnum;
use BackedEnum;

class QuoteResource extends Resource
{
    protected static ?string $model = Quote::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-document-currency-euro';
    
    protected static string|UnitEnum|null $navigationGroup = 'Demandes & Missions';

    protected static ?string $navigationLabel = 'Devis';

    protected static ?string $modelLabel = 'Devis';

    protected static ?string $pluralModelLabel = 'Devis';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Demande associée')
                    ->schema([
                        Forms\Components\Select::make('service_request_id')
                            ->label('Demande')
                            ->relationship('serviceRequest', 'request_number')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->live()
                            ->afterStateUpdated(function ($state, Set $set) {
                                if ($state) {
                                    $request = ServiceRequest::with('property')->find($state);
                                    if ($request && $request->property) {
                                        $pricingRule = PricingRule::getActive();
                                        if ($pricingRule) {
                                            $set('commission_rate', $pricingRule->platform_commission_rate);
                                        }
                                    }
                                }
                            }),
                        Forms\Components\TextInput::make('quote_number')
                            ->label('N° Devis')
                            ->disabled()
                            ->dehydrated(false),
                    ])->columns(2),

                Section::make('Informations du logement')
                    ->description('Données pour aider au calcul du prix')
                    ->schema([
                        Forms\Components\TextInput::make('property_type')
                            ->label('Type de logement')
                            ->disabled()
                            ->dehydrated(false)
                            ->formatStateUsing(fn ($state, Get $get): string => 
                                ServiceRequest::with('property')->find($get('service_request_id'))?->property?->type ?? '-'
                            ),
                        Forms\Components\TextInput::make('property_surface')
                            ->label('Surface')
                            ->disabled()
                            ->dehydrated(false)
                            ->suffix('m²')
                            ->formatStateUsing(fn ($state, Get $get): string => 
                                (string) (ServiceRequest::with('property')->find($get('service_request_id'))?->property?->surface_area ?? '-')
                            ),
                        Forms\Components\TextInput::make('property_city')
                            ->label('Ville')
                            ->disabled()
                            ->dehydrated(false)
                            ->formatStateUsing(fn ($state, Get $get): string => 
                                ServiceRequest::with('property')->find($get('service_request_id'))?->property?->city ?? '-'
                            ),
                        Forms\Components\TextInput::make('property_postal_code')
                            ->label('Code postal')
                            ->disabled()
                            ->dehydrated(false)
                            ->formatStateUsing(fn ($state, Get $get): string => 
                                ServiceRequest::with('property')->find($get('service_request_id'))?->property?->postal_code ?? '-'
                            ),
                        Forms\Components\TextInput::make('intervention_date')
                            ->label('Date d\'intervention')
                            ->disabled()
                            ->dehydrated(false)
                            ->formatStateUsing(fn ($state, Get $get): string => 
                                ServiceRequest::find($get('service_request_id'))?->scheduled_date?->format('d/m/Y') ?? '-'
                            ),
                        Forms\Components\TextInput::make('intervention_time')
                            ->label('Heure d\'intervention')
                            ->disabled()
                            ->dehydrated(false)
                            ->formatStateUsing(fn ($state, Get $get): string => 
                                ServiceRequest::find($get('service_request_id'))?->scheduled_time ?? '-'
                            ),
                    ])->columns(3),

                Section::make('Tarification')
                    ->schema([
                        Forms\Components\TextInput::make('final_price')
                            ->label('Prix final')
                            ->numeric()
                            ->suffix('€')
                            ->required()
                            ->live()
                            ->helperText('Définissez le prix final pour cette mission')
                            ->afterStateUpdated(function ($state, Set $set, Get $get) {
                                $rate = (float) ($get('commission_rate') ?? 25);
                                $final = (float) ($state ?? 0);
                                $commission = round($final * ($rate / 100), 2);
                                $agent = round($final - $commission, 2);
                                $set('commission_amount', $commission);
                                $set('agent_amount', $agent);
                            }),
                        Forms\Components\TextInput::make('estimated_hours')
                            ->label('Durée estimée')
                            ->numeric()
                            ->suffix('h')
                            ->step(0.5)
                            ->helperText('Nombre d\'heures prévu pour cette intervention'),
                        Forms\Components\TextInput::make('commission_rate')
                            ->label('Taux commission')
                            ->numeric()
                            ->suffix('%')
                            ->default(25)
                            ->live()
                            ->afterStateUpdated(function ($state, Set $set, Get $get) {
                                $rate = (float) ($state ?? 25);
                                $final = (float) ($get('final_price') ?? 0);
                                $commission = round($final * ($rate / 100), 2);
                                $agent = round($final - $commission, 2);
                                $set('commission_amount', $commission);
                                $set('agent_amount', $agent);
                            }),
                        Forms\Components\TextInput::make('commission_amount')
                            ->label('Montant commission')
                            ->numeric()
                            ->suffix('€')
                            ->disabled()
                            ->dehydrated(true),
                        Forms\Components\TextInput::make('agent_amount')
                            ->label('Montant agent')
                            ->numeric()
                            ->suffix('€')
                            ->disabled()
                            ->dehydrated(true),
                    ])->columns(3),

                Section::make('Notes internes (Admin)')
                    ->schema([
                        Forms\Components\Textarea::make('admin_notes')
                            ->label('Notes internes')
                            ->rows(2)
                            ->helperText('Visible uniquement par les admins'),
                        Forms\Components\Textarea::make('price_adjustment_reason')
                            ->label(' Détails sur le devis')
                            ->rows(2)
                            ->visible(fn (Get $get) => filled($get('final_price'))),
                    ])->columns(2),

                Section::make('Statut & Validation')
                    ->schema([
                        Forms\Components\Select::make('status')
                            ->label('Statut')
                            ->options([
                                'draft' => 'Brouillon',
                                'sent' => 'Envoyé',
                                'accepted' => 'Accepté',
                                'refused' => 'Refusé',
                                'expired' => 'Expiré',
                            ])
                            ->required()
                            ->default('draft'),
                        Forms\Components\DateTimePicker::make('expires_at')
                            ->label('Date d\'expiration'),
                        Forms\Components\DateTimePicker::make('sent_at')
                            ->label('Envoyé le')
                            ->disabled()
                            ->dehydrated(false),
                        Forms\Components\DateTimePicker::make('responded_at')
                            ->label('Répondu le')
                            ->disabled()
                            ->dehydrated(false),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('quote_number')
                    ->label('N° Devis')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('serviceRequest.request_number')
                    ->label('N° Demande')
                    ->searchable(),
                Tables\Columns\TextColumn::make('serviceRequest.client.name')
                    ->label('Client')
                    ->searchable(),
                Tables\Columns\TextColumn::make('serviceRequest.property.type')
                    ->label('Type')
                    ->badge(),
                Tables\Columns\TextColumn::make('estimated_price')
                    ->label('Estimé')
                    ->money('€')
                    ->sortable(),
                Tables\Columns\TextColumn::make('final_price')
                    ->label('Final')
                    ->money('€')
                    ->sortable()
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'draft' => 'gray',
                        'sent' => 'info',
                        'accepted' => 'success',
                        'refused' => 'danger',
                        'expired' => 'warning',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'draft' => 'Brouillon',
                        'sent' => 'Envoyé',
                        'accepted' => 'Accepté',
                        'refused' => 'Refusé',
                        'expired' => 'Expiré',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créé le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'draft' => 'Brouillon',
                        'sent' => 'Envoyé',
                        'accepted' => 'Accepté',
                        'refused' => 'Refusé',
                        'expired' => 'Expiré',
                    ]),
            ])
            ->actions([
                Action::make('send')
                    ->label('Envoyer')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('success')
                    ->visible(fn ($record) => $record->status === 'draft')
                    ->requiresConfirmation()
                    ->modalHeading('Envoyer le devis')
                    ->modalDescription('Le devis sera envoyé au client par email.')
                    ->action(function ($record) {
                        $record->update([
                            'status' => 'sent',
                            'sent_at' => now(),
                            'expires_at' => now()->addDays(7),
                            'validated_by' => auth()->id(),
                        ]);
                        $record->serviceRequest->update(['status' => 'quote_sent']);
                        Notification::make()
                            ->title('Devis envoyé')
                            ->success()
                            ->send();
                    }),
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
            'index' => Pages\ListQuotes::route('/'),
            'create' => Pages\CreateQuote::route('/create'),
            'view' => Pages\ViewQuote::route('/{record}'),
            'edit' => Pages\EditQuote::route('/{record}/edit'),
        ];
    }
}
