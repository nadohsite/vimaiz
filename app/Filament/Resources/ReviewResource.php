<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ReviewResource\Pages;
use App\Models\Review;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Actions\ViewAction;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Infolists\Components\TextEntry;
use BackedEnum;
use UnitEnum;

class ReviewResource extends Resource
{
    protected static ?string $model = Review::class;

    // Icône du menu
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-rectangle-stack';
    
    // Groupe de navigation (optionnel)
    protected static string|UnitEnum|null $navigationGroup = 'Gestion des Avis';

    protected static ?string $navigationLabel = 'Avis clients';

    protected static ?string $modelLabel = 'Avis';

    protected static ?string $pluralModelLabel = 'Avis';

    protected static ?int $navigationSort = 50; // Après les sections principales

    /**
     * Infolist pour affichage en lecture seule
     */
    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Informations de l\'avis')
                    ->schema([
                        TextEntry::make('client.name')
                            ->label('Client'),
                        TextEntry::make('agent.name')
                            ->label('Agent'),
                        TextEntry::make('mission.mission_number')
                            ->label('Mission'),
                        TextEntry::make('rating')
                            ->label('Note')
                            ->formatStateUsing(fn ($state) => $state . '/5')
                            ->badge()
                            ->color(fn ($state) => match (true) {
                                $state >= 4 => 'success',
                                $state >= 3 => 'warning',
                                default => 'danger',
                            }),
                        TextEntry::make('status')
                            ->label('Statut')
                            ->badge()
                            ->formatStateUsing(fn ($state) => match ($state) {
                                'pending' => 'En attente',
                                'approved' => 'Approuvé',
                                'rejected' => 'Rejeté',
                                default => $state,
                            })
                            ->color(fn ($state) => match ($state) {
                                'pending' => 'warning',
                                'approved' => 'success',
                                'rejected' => 'danger',
                                default => 'gray',
                            }),
                        TextEntry::make('created_at')
                            ->label('Date de création')
                            ->dateTime('d/m/Y H:i'),
                    ])->columns(3),
                Section::make('Contenu')
                    ->schema([
                        TextEntry::make('comment')
                            ->label('Commentaire du client')
                            ->columnSpanFull(),
                        TextEntry::make('agent_response')
                            ->label('Réponse de l\'agent')
                            ->columnSpanFull()
                            ->visible(fn ($record) => !empty($record->agent_response)),
                    ]),
                Section::make('Modération')
                    ->schema([
                        TextEntry::make('moderated_at')
                            ->label('Modéré le')
                            ->dateTime('d/m/Y H:i'),
                        TextEntry::make('rejection_reason')
                            ->label('Raison du rejet')
                            ->visible(fn ($record) => $record->status === 'rejected'),
                    ])
                    ->visible(fn ($record) => $record->status !== 'pending'),
            ]);
    }

    /**
     * Formulaire (non utilisé - lecture seule)
     */
    public static function form(Schema $schema): Schema
    {
        return $schema->schema([]);
    }

    /**
     * Table d'affichage des enregistrements
     */
    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('client.name')
                    ->label('Client')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('agent.name')
                    ->label('Agent')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('rating')
                    ->label('Note')
                    ->badge()
                    ->formatStateUsing(fn ($state): string => $state . '/5')
                    ->color(fn ($state): string => match (true) {
                        $state >= 4 => 'success',
                        $state >= 3 => 'warning',
                        default => 'danger',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('comment')
                    ->label('Commentaire')
                    ->limit(50)
                    ->wrap(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'pending' => 'En attente',
                        'approved' => 'Approuvé',
                        'rejected' => 'Rejeté',
                        default => $state ?? '-',
                    })
                    ->color(fn (?string $state): string => match ($state) {
                        'pending' => 'warning',
                        'approved' => 'success',
                        'rejected' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Date')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'pending' => 'En attente',
                        'approved' => 'Approuvé',
                        'rejected' => 'Rejeté',
                    ]),
                Tables\Filters\SelectFilter::make('rating')
                    ->label('Note')
                    ->options([
                        '5' => '5 étoiles',
                        '4' => '4 étoiles',
                        '3' => '3 étoiles',
                        '2' => '2 étoiles',
                        '1' => '1 étoile',
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
    public static function canCreate(): bool
    {
        return false; // Les avis sont créés par les clients
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReviews::route('/'),
            'view' => Pages\ViewReview::route('/{record}'),
        ];
    }
}
