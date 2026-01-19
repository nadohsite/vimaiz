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
use Filament\Notifications\Notification;
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
                Forms\Components\Section::make('Demande associée')
                    ->schema([
                        Forms\Components\Select::make('service_request_id')
                            ->label('Demande')
                            ->relationship('serviceRequest', 'request_number')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->live()
                            ->afterStateUpdated(function ($state, Forms\Set $set) {
                                if ($state) {
                                    $request = ServiceRequest::with('property')->find($state);
                                    if ($request && $request->property) {
                                        $pricingRule = PricingRule::getActive();
                                        if ($pricingRule) {
                                            $scheduledAt = \Carbon\Carbon::parse(
                                                $request->scheduled_date->format('Y-m-d') . ' ' . $request->scheduled_time
                                            );
                                            $calculation = $pricingRule->calculatePrice(
                                                $request->property->type,
                                                $request->property->surface_area,
                                                $request->requested_hours,
                                                $scheduledAt,
                                                $request->property->postal_code
                                            );
                                            $set('estimated_price', $calculation['estimated_price']);
                                            $set('commission_rate', $calculation['commission_rate']);
                                            $set('commission_amount', $calculation['commission_amount']);
                                            $set('agent_amount', $calculation['agent_amount']);
                                        }
                                    }
                                }
                            }),
                        Forms\Components\TextInput::make('quote_number')
                            ->label('N° Devis')
                            ->disabled()
                            ->dehydrated(false),
                    ])->columns(2),

                Forms\Components\Section::make('Tarification')
                    ->schema([
                        Forms\Components\TextInput::make('estimated_price')
                            ->label('Prix estimé (auto)')
                            ->numeric()
                            ->prefix('€')
                            ->disabled()
                            ->dehydrated(true),
                        Forms\Components\TextInput::make('final_price')
                            ->label('Prix final (ajusté)')
                            ->numeric()
                            ->prefix('€')
                            ->helperText('Laissez vide pour utiliser le prix estimé'),
                        Forms\Components\TextInput::make('commission_rate')
                            ->label('Taux commission')
                            ->numeric()
                            ->suffix('%')
                            ->default(20),
                        Forms\Components\TextInput::make('commission_amount')
                            ->label('Montant commission')
                            ->numeric()
                            ->prefix('€')
                            ->disabled()
                            ->dehydrated(true),
                        Forms\Components\TextInput::make('agent_amount')
                            ->label('Montant agent')
                            ->numeric()
                            ->prefix('€')
                            ->disabled()
                            ->dehydrated(true),
                    ])->columns(3),

                Forms\Components\Section::make('Notes internes (Admin)')
                    ->schema([
                        Forms\Components\Textarea::make('admin_notes')
                            ->label('Notes internes')
                            ->rows(2)
                            ->helperText('Visible uniquement par les admins'),
                        Forms\Components\Textarea::make('price_adjustment_reason')
                            ->label('Raison de l\'ajustement')
                            ->rows(2)
                            ->visible(fn (Forms\Get $get) => filled($get('final_price'))),
                    ])->columns(2),

                Forms\Components\Section::make('Statut & Validation')
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
                    ->money('EUR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('final_price')
                    ->label('Final')
                    ->money('EUR')
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
                Tables\Actions\Action::make('send')
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
            'index' => Pages\ListQuotes::route('/'),
            'create' => Pages\CreateQuote::route('/create'),
            'view' => Pages\ViewQuote::route('/{record}'),
            'edit' => Pages\EditQuote::route('/{record}/edit'),
        ];
    }
}
