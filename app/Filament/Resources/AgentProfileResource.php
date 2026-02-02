<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AgentProfileResource\Pages;
use App\Models\AgentProfile;
use App\Notifications\DocumentsVerifiedNotification;
use App\Notifications\DocumentsRejectedNotification;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Actions\Action;
use Filament\Actions\ViewAction;
use Filament\Actions\EditAction;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Storage;
use UnitEnum;
use BackedEnum;

class AgentProfileResource extends Resource
{
    protected static ?string $model = AgentProfile::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-identification';
    
    protected static string|UnitEnum|null $navigationGroup = 'Gestion Utilisateurs';

    protected static ?string $navigationLabel = 'Profils Agents';

    protected static ?string $modelLabel = 'Profil Agent';

    protected static ?string $pluralModelLabel = 'Profils Agents';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Informations Agent')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->label('Utilisateur')
                            ->relationship('user', 'name')
                            ->disabled(),
                        Forms\Components\Select::make('agent_type')
                            ->label('Type')
                            ->options([
                                'individual' => 'Particulier',
                                'company' => 'Entreprise',
                            ])
                            ->disabled(),
                        Forms\Components\TextInput::make('company_name')
                            ->label('Nom entreprise')
                            ->disabled(),
                        Forms\Components\TextInput::make('siret')
                            ->label('SIRET')
                            ->disabled(),
                    ])->columns(2),

                Section::make('Statut de vérification')
                    ->schema([
                        Forms\Components\Select::make('verification_status')
                            ->label('Statut')
                            ->options([
                                'pending' => 'En attente',
                                'submitted' => 'Soumis',
                                'verified' => 'Vérifié',
                                'rejected' => 'Rejeté',
                            ]),
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('Raison du rejet')
                            ->visible(fn ($get) => $get('verification_status') === 'rejected'),
                    ]),

                Section::make('Statistiques')
                    ->schema([
                        Forms\Components\TextInput::make('missions_completed')
                            ->label('Missions terminées')
                            ->disabled(),
                        Forms\Components\TextInput::make('average_rating')
                            ->label('Note moyenne')
                            ->disabled(),
                        Forms\Components\TextInput::make('warnings_count')
                            ->label('Avertissements')
                            ->disabled(),
                    ])->columns(3),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('profile_photo')
                    ->label('Photo')
                    ->circular()
                    ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->user?->name ?? 'Agent') . '&background=0ea5e9&color=fff')
                    ->disk('public'),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Nom')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('user.email')
                    ->label('Email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('agent_type')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'individual' => 'Particulier',
                        'company' => 'Entreprise',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'individual' => 'info',
                        'company' => 'primary',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('verification_status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'En attente',
                        'submitted' => 'Soumis',
                        'verified' => 'Vérifié',
                        'rejected' => 'Rejeté',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'gray',
                        'submitted' => 'warning',
                        'verified' => 'success',
                        'rejected' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('missions_completed')
                    ->label('Missions')
                    ->sortable(),
                Tables\Columns\TextColumn::make('average_rating')
                    ->label('Note')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state, 1) . '/5' : '-')
                    ->sortable(),
                Tables\Columns\IconColumn::make('documents_complete')
                    ->label('Documents')
                    ->state(function ($record) {
                        return $record->id_document && $record->address_proof;
                    })
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Inscrit le')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('verification_status')
                    ->label('Statut de vérification')
                    ->options([
                        'pending' => 'En attente',
                        'submitted' => 'Soumis',
                        'verified' => 'Vérifié',
                        'rejected' => 'Rejeté',
                    ]),
                Tables\Filters\SelectFilter::make('agent_type')
                    ->label('Type')
                    ->options([
                        'individual' => 'Particulier',
                        'company' => 'Entreprise',
                    ]),
                Tables\Filters\Filter::make('has_documents')
                    ->label('Avec documents')
                    ->query(fn ($query) => $query->whereNotNull('id_document')),
            ])
            ->actions([
                Action::make('verify')
                    ->label('Valider')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => in_array($record->verification_status, ['pending', 'submitted']))
                    ->requiresConfirmation()
                    ->modalHeading('Valider les documents')
                    ->modalDescription('Confirmez que tous les documents de cet agent sont valides.')
                    ->action(function ($record) {
                        $record->update([
                            'verification_status' => 'verified',
                            'rejection_reason' => null,
                        ]);
                        
                        // Notify agent
                        if ($record->user) {
                            $record->user->notify(new DocumentsVerifiedNotification());
                        }
                        
                        Notification::make()
                            ->title('Documents validés')
                            ->body('L\'agent a été notifié par email.')
                            ->success()
                            ->send();
                    }),
                Action::make('reject')
                    ->label('Rejeter')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn ($record) => in_array($record->verification_status, ['pending', 'submitted']))
                    ->form([
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('Raison du rejet')
                            ->required()
                            ->placeholder('Expliquez pourquoi les documents sont rejetés...'),
                    ])
                    ->action(function ($record, array $data) {
                        $record->update([
                            'verification_status' => 'rejected',
                            'rejection_reason' => $data['rejection_reason'],
                        ]);
                        
                        // Notify agent
                        if ($record->user) {
                            $record->user->notify(new DocumentsRejectedNotification($data['rejection_reason']));
                        }
                        
                        Notification::make()
                            ->title('Documents rejetés')
                            ->body('L\'agent a été notifié par email.')
                            ->warning()
                            ->send();
                    }),
                Action::make('view_documents')
                    ->label('Voir documents')
                    ->icon('heroicon-o-document-text')
                    ->color('info')
                    ->url(fn ($record) => static::getUrl('documents', ['record' => $record])),
                Action::make('warn')
                    ->label('Avertir')
                    ->icon('heroicon-o-exclamation-triangle')
                    ->color('warning')
                    ->visible(fn ($record) => $record->verification_status === 'verified')
                    ->form([
                        Forms\Components\Textarea::make('reason')
                            ->label('Raison de l\'avertissement')
                            ->required()
                            ->placeholder('Décrivez la raison de cet avertissement...'),
                    ])
                    ->action(function ($record, array $data) {
                        $record->increment('warnings_count');
                        
                        // Log sanction history
                        $record->sanctions()->create([
                            'admin_id' => auth()->id(),
                            'type' => 'warning',
                            'reason' => $data['reason'],
                        ]);
                        
                        // Notify agent
                        if ($record->user) {
                            $record->user->notify(new \App\Notifications\AgentWarningNotification($data['reason'], $record->warnings_count));
                        }
                        
                        Notification::make()
                            ->title('Avertissement envoyé')
                            ->body('L\'agent a maintenant ' . $record->warnings_count . ' avertissement(s).')
                            ->warning()
                            ->send();
                    }),
                Action::make('suspend')
                    ->label('Suspendre')
                    ->icon('heroicon-o-pause-circle')
                    ->color('danger')
                    ->visible(fn ($record) => !$record->suspended_until || $record->suspended_until->isPast())
                    ->form([
                        Forms\Components\Select::make('duration')
                            ->label('Durée de suspension')
                            ->options([
                                '7' => '7 jours',
                                '14' => '14 jours',
                                '30' => '30 jours',
                                '90' => '90 jours',
                            ])
                            ->required(),
                        Forms\Components\Textarea::make('reason')
                            ->label('Raison de la suspension')
                            ->required()
                            ->placeholder('Décrivez la raison de cette suspension...'),
                    ])
                    ->action(function ($record, array $data) {
                        $suspendedUntil = now()->addDays((int) $data['duration']);
                        $record->update(['suspended_until' => $suspendedUntil]);
                        
                        // Log sanction history
                        $record->sanctions()->create([
                            'admin_id' => auth()->id(),
                            'type' => 'suspension',
                            'reason' => $data['reason'],
                            'suspension_days' => (int) $data['duration'],
                            'expires_at' => $suspendedUntil,
                        ]);
                        
                        // Notify agent
                        if ($record->user) {
                            $record->user->notify(new \App\Notifications\AgentSuspendedNotification($data['reason'], $suspendedUntil));
                        }
                        
                        Notification::make()
                            ->title('Agent suspendu')
                            ->body('Suspension jusqu\'au ' . $suspendedUntil->format('d/m/Y'))
                            ->danger()
                            ->send();
                    }),
                Action::make('unsuspend')
                    ->label('Lever suspension')
                    ->icon('heroicon-o-play-circle')
                    ->color('success')
                    ->visible(fn ($record) => $record->suspended_until && $record->suspended_until->isFuture())
                    ->requiresConfirmation()
                    ->modalHeading('Lever la suspension')
                    ->modalDescription('L\'agent pourra à nouveau recevoir des missions.')
                    ->action(function ($record) {
                        $record->update(['suspended_until' => null]);
                        
                        // Log sanction history
                        $record->sanctions()->create([
                            'admin_id' => auth()->id(),
                            'type' => 'unsuspend',
                            'reason' => 'Suspension levée par l\'administrateur',
                        ]);
                        
                        Notification::make()
                            ->title('Suspension levée')
                            ->success()
                            ->send();
                    }),
                Action::make('ban')
                    ->label('Exclure définitivement')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->visible(fn ($record) => !$record->is_banned)
                    ->form([
                        Forms\Components\Textarea::make('reason')
                            ->label('Raison de l\'exclusion')
                            ->required()
                            ->placeholder('Décrivez la raison de cette exclusion définitive...'),
                    ])
                    ->requiresConfirmation()
                    ->modalHeading('Exclure définitivement cet agent')
                    ->modalDescription('⚠️ Cette action est irréversible. L\'agent ne pourra plus jamais utiliser la plateforme.')
                    ->action(function ($record, array $data) {
                        $record->update([
                            'is_banned' => true,
                            'banned_at' => now(),
                            'ban_reason' => $data['reason'],
                            'is_available' => false,
                        ]);
                        
                        // Log sanction history
                        $record->sanctions()->create([
                            'admin_id' => auth()->id(),
                            'type' => 'ban',
                            'reason' => $data['reason'],
                        ]);
                        
                        // Notify agent
                        if ($record->user) {
                            $record->user->notify(new \App\Notifications\AgentBannedNotification($data['reason']));
                        }
                        
                        Notification::make()
                            ->title('Agent exclu définitivement')
                            ->body('L\'agent a été notifié par email.')
                            ->danger()
                            ->send();
                    }),
                ViewAction::make(),
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    BulkAction::make('verify_selected')
                        ->label('Valider sélectionnés')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function ($records) {
                            $records->each(function ($record) {
                                $record->update(['verification_status' => 'verified', 'rejection_reason' => null]);
                                if ($record->user) {
                                    $record->user->notify(new DocumentsVerifiedNotification());
                                }
                            });
                            
                            Notification::make()
                                ->title('Documents validés')
                                ->success()
                                ->send();
                        }),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            \App\Filament\Resources\AgentProfileResource\RelationManagers\SanctionsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAgentProfiles::route('/'),
            'view' => Pages\ViewAgentProfile::route('/{record}'),
            'edit' => Pages\EditAgentProfile::route('/{record}/edit'),
            'documents' => Pages\ViewAgentDocuments::route('/{record}/documents'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('verification_status', 'submitted')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }
}
