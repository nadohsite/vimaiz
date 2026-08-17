<?php

namespace App\Filament\Resources;

use App\Filament\Resources\QuoteResource\Pages;
use App\Models\PricingRule;
use App\Models\Quote;
use App\Models\ServiceRequest;
use App\Services\QuoteCalculationService;
use BackedEnum;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms;
use Filament\Infolists\Components\TextEntry;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\View as SchemaView;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Support\Enums\FontWeight;
use Filament\Tables;
use Filament\Tables\Table;
use UnitEnum;

class QuoteResource extends Resource
{
    protected static ?string $model = Quote::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-document-currency-euro';

    protected static string|UnitEnum|null $navigationGroup = 'Demandes & Interventions';

    protected static ?string $navigationLabel = 'Devis';

    protected static ?string $modelLabel = 'Devis';

    protected static ?string $pluralModelLabel = 'Devis';

    protected static ?int $navigationSort = 2;

    /**
     * @return array{
     *     name: string,
     *     type: string,
     *     address_line1: ?string,
     *     address_line2: ?string,
     *     city: string,
     *     postal_code: string,
     *     characteristics: list<array{label: string, value: string, icon: string}>,
     *     date: string,
     *     date_long: string,
     *     time: string,
     *     duration: string,
     *     show_type: bool
     * }
     */
    public static function interventionContext(mixed $serviceRequestId): array
    {
        $request = $serviceRequestId
            ? ServiceRequest::with(['property', 'client'])->find($serviceRequestId)
            : null;
        $property = $request?->property;

        $surface = $property?->surface_area;

        $characteristics = [
            [
                'label' => 'Type',
                'value' => $property?->type_label ?: '—',
                'icon' => 'home',
            ],
            [
                'label' => 'Surface',
                'value' => $surface !== null && $surface !== ''
                    ? number_format((float) $surface, 2, '.', '').' m²'
                    : '—',
                'icon' => 'maximize',
            ],
            [
                'label' => 'Chambres',
                'value' => (string) ((int) ($property?->bedrooms ?? 0)),
                'icon' => 'bed',
            ],
            [
                'label' => 'Salles de bain',
                'value' => (string) ((int) ($property?->bathrooms ?? 0)),
                'icon' => 'bath',
            ],
            [
                'label' => 'Date',
                'value' => $request?->scheduled_date?->format('d/m/Y') ?: '—',
                'icon' => 'calendar',
            ],
            [
                'label' => 'Heure',
                'value' => self::formatScheduledTime($request?->scheduled_time),
                'icon' => 'clock',
            ],
        ];

        return [
            'name' => $property?->name ?: ($property?->type_label ?: '—'),
            'type' => $property?->type_label ?: '—',
            'address_line1' => $property?->address_line1,
            'address_line2' => $property?->address_line2,
            'city' => $property?->city ?: '—',
            'postal_code' => $property?->postal_code ?: '',
            'characteristics' => $characteristics,
            'date' => $request?->scheduled_date?->format('d/m/Y') ?: '—',
            'date_long' => $request?->scheduled_date?->translatedFormat('l j F') ?: '—',
            'time' => self::formatScheduledTime($request?->scheduled_time),
            'duration' => $request?->requested_hours
                ? rtrim(rtrim(number_format((float) $request->requested_hours, 1, ',', ' '), '0'), ',').' h'
                : '—',
            'show_type' => filled($property?->name),
        ];
    }

    protected static function formatScheduledTime(mixed $time): string
    {
        if (blank($time)) {
            return '—';
        }

        if ($time instanceof CarbonInterface) {
            return $time->format('H:i');
        }

        try {
            return Carbon::parse((string) $time)->format('H:i');
        } catch (\Throwable) {
            return trim((string) $time);
        }
    }

    /**
     * @return array{commission: float, agent: float}
     */
    protected static function amountsFromForm(Get $get): array
    {
        $rate = (float) ($get('commission_rate') ?? (PricingRule::getActive()?->platform_commission_rate ?? 20));
        $final = (float) ($get('final_price') ?? 0);
        $commission = round($final * ($rate / 100), 2);

        return [
            'commission' => $commission,
            'agent' => round($final - $commission, 2),
        ];
    }

    protected static function formatEuro(float $amount): string
    {
        return number_format($amount, 2, ',', ' ').' €';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->schema([
                Section::make('Demande')
                    ->columnSpanFull()
                    ->schema([
                        Forms\Components\Select::make('service_request_id')
                            ->label('Demande')
                            ->relationship(
                                'serviceRequest',
                                'request_number',
                                fn ($query) => $query->with(['client', 'property']),
                            )
                            ->getOptionLabelFromRecordUsing(function (ServiceRequest $record): string {
                                $client = $record->client?->name ?? 'Client';
                                $city = $record->property?->city;

                                return trim($record->request_number.' — '.$client.($city ? ' — '.$city : ''));
                            })
                            ->searchable()
                            ->preload()
                            ->required()
                            ->live()
                            ->columnSpanFull()
                            ->afterStateUpdated(function ($state, Set $set) {
                                if ($state) {
                                    $pricingRule = PricingRule::getActive();
                                    if ($pricingRule) {
                                        $set('commission_rate', $pricingRule->platform_commission_rate);
                                    }
                                }
                            }),
                        Forms\Components\TextInput::make('quote_number')
                            ->label('N° Devis')
                            ->disabled()
                            ->dehydrated(false)
                            ->hiddenOn('create'),
                        SchemaView::make('filament.quotes.intervention-context')
                            ->visible(fn (Get $get): bool => filled($get('service_request_id')))
                            ->columnSpanFull()
                            ->viewData(fn (Get $get): array => [
                                'context' => self::interventionContext($get('service_request_id')),
                            ]),
                    ]),

                Section::make('Tarification')
                    ->columnSpanFull()
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                Forms\Components\TextInput::make('final_price')
                                    ->label('Prix final')
                                    ->numeric()
                                    ->suffix('€')
                                    ->required()
                                    ->live(),
                                Forms\Components\TextInput::make('estimated_hours')
                                    ->label('Durée estimée')
                                    ->numeric()
                                    ->suffix('h')
                                    ->step(0.5),
                                Forms\Components\TextInput::make('commission_rate')
                                    ->label('Taux commission')
                                    ->numeric()
                                    ->suffix('%')
                                    ->default(fn () => PricingRule::getActive()?->platform_commission_rate ?? 20)
                                    ->live(),
                            ]),
                        Grid::make(2)
                            ->schema([
                                TextEntry::make('commission_amount_info')
                                    ->label('Montant commission')
                                    ->icon('heroicon-o-banknotes')
                                    ->weight(FontWeight::SemiBold)
                                    ->color('warning')
                                    ->state(fn (Get $get): string => self::formatEuro(self::amountsFromForm($get)['commission'])),
                                TextEntry::make('agent_amount_info')
                                    ->label('Montant intervenant')
                                    ->icon('heroicon-o-user')
                                    ->weight(FontWeight::SemiBold)
                                    ->color('success')
                                    ->state(fn (Get $get): string => self::formatEuro(self::amountsFromForm($get)['agent'])),
                            ]),
                        Forms\Components\Textarea::make('price_adjustment_reason')
                            ->label('Détails du devis')
                            ->rows(3)
                            ->columnSpanFull()
                            ->helperText('Visible par le client sur le devis et dans l\'email'),
                    ]),

                Section::make('Statut')
                    ->columnSpanFull()
                    ->hiddenOn('create')
                    ->schema([
                        Forms\Components\Select::make('status')
                            ->label('Statut')
                            ->options(function (?Quote $record) {
                                $options = [
                                    'draft' => 'Brouillon',
                                    'sent' => 'Envoyé',
                                    'accepted' => 'Accepté',
                                    'refused' => 'Refusé',
                                    'expired' => 'Expiré',
                                ];

                                if ($record?->status === Quote::STATUS_PAID) {
                                    $options['paid'] = 'Payé';
                                }

                                return $options;
                            })
                            ->disabled(fn (?Quote $record) => $record?->status === Quote::STATUS_PAID)
                            ->required()
                            ->default(Quote::STATUS_SENT),
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
                        'paid' => 'success',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'draft' => 'Brouillon',
                        'sent' => 'Envoyé',
                        'accepted' => 'Accepté',
                        'refused' => 'Refusé',
                        'expired' => 'Expiré',
                        'paid' => 'Payé',
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
                        'paid' => 'Payé',
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
                        app(QuoteCalculationService::class)
                            ->sendQuote($record, auth()->id());
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
