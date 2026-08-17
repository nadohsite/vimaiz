<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MissionResource\Pages;
use App\Models\Mission;
use App\Models\User;
use App\Services\MissionService;
use App\Support\DurationFormatter;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use UnitEnum;

class MissionResource extends Resource
{
    protected static ?string $model = Mission::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-briefcase';

    protected static string|UnitEnum|null $navigationGroup = 'Demandes & Interventions';

    protected static ?string $navigationLabel = 'Interventions';

    protected static ?string $modelLabel = 'Intervention';

    protected static ?string $pluralModelLabel = 'Interventions';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Informations générales')
                    ->schema([
                        Forms\Components\TextInput::make('mission_number')
                            ->label('N° Intervention')
                            ->disabled(),
                        Forms\Components\Select::make('client_id')
                            ->label('Client')
                            ->relationship('client', 'name')
                            ->getOptionLabelFromRecordUsing(fn ($record) => $record->name ?? $record->email ?? "Client #{$record->id}")
                            ->disabled(),
                        Forms\Components\Select::make('agent_id')
                            ->label('Intervenant')
                            ->relationship('agent', 'name')
                            ->getOptionLabelFromRecordUsing(fn ($record) => $record->name ?? $record->email ?? "Intervenant #{$record->id}")
                            ->searchable()
                            ->preload(),
                    ])->columns(3),

                Section::make('Bien')
                    ->schema([
                        Forms\Components\Select::make('property_id')
                            ->label('Bien')
                            ->relationship('property', 'name')
                            ->getOptionLabelFromRecordUsing(fn ($record) => $record->name ?? "Bien #{$record->id}")
                            ->disabled(),
                    ]),

                Section::make('Planification')
                    ->schema([
                        Forms\Components\DateTimePicker::make('scheduled_at')
                            ->label('Date et heure prévues'),
                        Forms\Components\TextInput::make('duration_hours')
                            ->label('Durée estimée')
                            ->suffix('heures')
                            ->disabled(),
                        Forms\Components\Placeholder::make('actual_duration_label')
                            ->label('Durée réelle')
                            ->content(fn (?Mission $record): string => $record?->actual_duration_label ?? '—'),
                        Forms\Components\DateTimePicker::make('started_at')
                            ->label('Démarrée le'),
                        Forms\Components\DateTimePicker::make('completed_at')
                            ->label('Terminée le'),
                    ])->columns(2),

                Section::make('Tarification')
                    ->schema([
                        Forms\Components\TextInput::make('total_price')
                            ->label('Prix total')
                            ->prefix('€')
                            ->disabled(),
                        Forms\Components\TextInput::make('agent_payout')
                            ->label('Paiement intervenant')
                            ->prefix('€')
                            ->disabled(),
                        Forms\Components\TextInput::make('platform_fee')
                            ->label('Commission VIMAIZ')
                            ->prefix('€')
                            ->disabled(),
                    ])->columns(3),

                Section::make('Statut')
                    ->schema([
                        Forms\Components\Select::make('status')
                            ->label('Statut intervention')
                            ->options([
                                'pending_agent' => 'En attente intervenant',
                                'agent_accepted' => 'Intervenant confirmé',
                                'agent_refused' => 'Intervenant refusé',
                                'in_progress' => 'En cours',
                                'photos_before' => 'Photos avant OK',
                                'photos_after' => 'Photos après OK',
                                'completed' => 'Terminée',
                                'cancelled' => 'Annulée',
                            ]),
                        Forms\Components\Select::make('payment_status')
                            ->label('Statut paiement')
                            ->options([
                                'pending' => 'En attente',
                                'paid' => 'Payé',
                                'refunded' => 'Remboursé',
                            ]),
                    ])->columns(2),

                Section::make('Rapport d\'intervention')
                    ->schema([
                        Forms\Components\Placeholder::make('report_status')
                            ->label('Rapport')
                            ->content(function (?Mission $record): string {
                                if (! $record?->hasReport()) {
                                    return 'Pas encore soumis';
                                }
                                if ($record->report_nothing_to_report) {
                                    return 'Aucune anomalie signalée';
                                }
                                $count = $record->anomalies()->count();

                                return $count.' anomalie'.($count > 1 ? 's' : '').' signalée'.($count > 1 ? 's' : '');
                            }),
                        Forms\Components\Placeholder::make('checklist_progress')
                            ->label('Checklist')
                            ->content(function (?Mission $record): string {
                                if (! $record) {
                                    return '—';
                                }
                                $progress = $record->checklistProgress();
                                if ($progress['total'] === 0) {
                                    return 'Aucune tâche';
                                }

                                return $progress['checked'].'/'.$progress['total'].' tâches complétées';
                            }),
                        Forms\Components\Placeholder::make('anomalies_list')
                            ->label('Anomalies')
                            ->content(function (?Mission $record): string {
                                if (! $record) {
                                    return '—';
                                }
                                $anomalies = $record->anomalies()->get();
                                if ($anomalies->isEmpty()) {
                                    return $record->hasReport() ? 'Rien à signaler' : '—';
                                }

                                return $anomalies
                                    ->map(fn ($anomaly) => '• '.$anomaly->category_label.' — '.$anomaly->label.($anomaly->notes ? ' ('.$anomaly->notes.')' : ''))
                                    ->implode("\n");
                            })
                            ->columnSpanFull(),
                    ])
                    ->columns(2)
                    ->collapsed(fn (?Mission $record) => ! $record?->hasReport()),

                Section::make('Contrôle qualité (Admin)')
                    ->schema([
                        Forms\Components\Select::make('internal_quality_score')
                            ->label('Note qualité interne')
                            ->options([
                                1 => '1 - Très mauvais',
                                2 => '2 - Mauvais',
                                3 => '3 - Correct',
                                4 => '4 - Bon',
                                5 => '5 - Excellent',
                            ]),
                        Forms\Components\Textarea::make('internal_quality_notes')
                            ->label('Notes qualité (internes)')
                            ->rows(3),
                    ])->columns(2),

                Section::make('Annulation')
                    ->schema([
                        Forms\Components\Textarea::make('cancellation_reason')
                            ->label('Raison annulation'),
                        Forms\Components\DateTimePicker::make('cancelled_at')
                            ->label('Annulée le'),
                    ])
                    ->collapsed()
                    ->visible(fn ($record) => $record?->status === 'cancelled'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('mission_number')
                    ->label('N° Intervention')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('client.name')
                    ->label('Client')
                    ->searchable(),
                Tables\Columns\TextColumn::make('agent.name')
                    ->label('Intervenant')
                    ->searchable()
                    ->placeholder('Non attribué'),
                Tables\Columns\TextColumn::make('property.type')
                    ->label('Type')
                    ->badge(),
                Tables\Columns\TextColumn::make('property.city')
                    ->label('Ville'),
                Tables\Columns\TextColumn::make('scheduled_at')
                    ->label('Planifiée')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('total_price')
                    ->label('Prix')
                    ->money('EUR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending_agent' => 'warning',
                        'agent_accepted' => 'info',
                        'agent_refused' => 'danger',
                        'in_progress' => 'primary',
                        'photos_before', 'photos_after' => 'info',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending_agent' => 'Attente intervenant',
                        'agent_accepted' => 'Confirmé',
                        'agent_refused' => 'Refusé',
                        'in_progress' => 'En cours',
                        'photos_before' => 'Photos avant',
                        'photos_after' => 'Photos après',
                        'completed' => 'Terminée',
                        'cancelled' => 'Annulée',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('payment_status')
                    ->label('Paiement')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'paid' => 'success',
                        'refunded' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'En attente',
                        'paid' => 'Payé',
                        'refunded' => 'Remboursé',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('actual_duration_minutes')
                    ->label('Durée réelle')
                    ->formatStateUsing(fn (?int $state): string => DurationFormatter::minutes($state))
                    ->toggleable(),
                Tables\Columns\TextColumn::make('anomalies_count')
                    ->counts('anomalies')
                    ->label('Anomalies')
                    ->badge()
                    ->color(fn ($state): string => $state > 0 ? 'warning' : 'success')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('internal_quality_score')
                    ->label('Qualité')
                    ->badge()
                    ->color(fn (?int $state): string => match (true) {
                        $state === null => 'gray',
                        $state >= 4 => 'success',
                        $state === 3 => 'warning',
                        default => 'danger',
                    }),
            ])
            ->defaultSort('scheduled_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'pending_agent' => 'En attente intervenant',
                        'agent_accepted' => 'Intervenant confirmé',
                        'in_progress' => 'En cours',
                        'completed' => 'Terminée',
                        'cancelled' => 'Annulée',
                    ]),
                Tables\Filters\SelectFilter::make('payment_status')
                    ->label('Paiement')
                    ->options([
                        'pending' => 'En attente',
                        'paid' => 'Payé',
                        'refunded' => 'Remboursé',
                    ]),
            ])
            ->actions([
                Action::make('assign_agent')
                    ->label('Attribuer intervenant')
                    ->icon('heroicon-o-user-plus')
                    ->color('success')
                    ->visible(fn ($record) => $record->needsAgent())
                    ->form([
                        Forms\Components\Select::make('agent_id')
                            ->label('Intervenant')
                            ->options(function () {
                                return User::where('role', 'agent')
                                    ->where('is_active', true)
                                    ->whereHas('agentProfile', function ($q) {
                                        $q->where('verification_status', 'verified')
                                            ->where('is_available', true)
                                            ->where('is_banned', false)
                                            ->where(function ($query) {
                                                $query->whereNull('suspended_until')
                                                    ->orWhere('suspended_until', '<', now());
                                            });
                                    })
                                    ->pluck('name', 'id');
                            })
                            ->searchable()
                            ->required(),
                    ])
                    ->action(function ($record, array $data) {
                        $agent = User::findOrFail($data['agent_id']);
                        app(MissionService::class)
                            ->assignSpecificAgent($record, $agent);
                        Notification::make()
                            ->title('Intervenant attribué')
                            ->success()
                            ->send();
                    }),
                Action::make('view_photos')
                    ->label('Photos')
                    ->icon('heroicon-o-camera')
                    ->color('info')
                    ->url(fn ($record) => MissionResource::getUrl('photos', ['record' => $record])),
                Action::make('quality_check')
                    ->label('Contrôle qualité')
                    ->icon('heroicon-o-star')
                    ->color('warning')
                    ->visible(fn ($record) => $record->status === 'completed' && ! $record->internal_quality_score)
                    ->form([
                        Forms\Components\Select::make('internal_quality_score')
                            ->label('Note qualité')
                            ->options([
                                1 => '1 - Très mauvais',
                                2 => '2 - Mauvais',
                                3 => '3 - Correct',
                                4 => '4 - Bon',
                                5 => '5 - Excellent',
                            ])
                            ->required(),
                        Forms\Components\Textarea::make('internal_quality_notes')
                            ->label('Notes (internes)')
                            ->rows(3),
                    ])
                    ->action(function ($record, array $data) {
                        $record->update($data);
                        Notification::make()
                            ->title('Contrôle qualité enregistré')
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
            'index' => Pages\ListMissions::route('/'),
            'create' => Pages\CreateMission::route('/create'),
            'view' => Pages\ViewMission::route('/{record}'),
            'edit' => Pages\EditMission::route('/{record}/edit'),
            'photos' => Pages\ViewMissionPhotos::route('/{record}/photos'),
        ];
    }
}
