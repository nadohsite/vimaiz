<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ConversationResource\Pages;
use App\Models\Conversation;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Actions\ViewAction;
use Filament\Actions\DeleteAction;
use Filament\Tables\Table;
use Filament\Tables\Grouping\Group;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

use UnitEnum;
use BackedEnum;

class ConversationResource extends Resource
{
    protected static ?string $model = Conversation::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static string|UnitEnum|null $navigationGroup = 'Communication';

    protected static ?string $navigationLabel = 'Conversations';

    protected static ?string $modelLabel = 'Conversation';

    protected static ?string $pluralModelLabel = 'Conversations';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\Select::make('client_id')
                    ->label('Client')
                    ->relationship('client', 'name', fn (Builder $query) => $query->where('role', 'client'))
                    ->getOptionLabelFromRecordUsing(fn ($record) => $record->name ?? $record->email ?? "Client #{$record->id}")
                    ->searchable()
                    ->preload()
                    ->required(),
                Forms\Components\Select::make('agent_id')
                    ->label('Intervenant')
                    ->relationship('agent', 'name', fn (Builder $query) => $query->where('role', 'agent'))
                    ->getOptionLabelFromRecordUsing(fn ($record) => $record->name ?? $record->email ?? "Intervenant #{$record->id}")
                    ->searchable()
                    ->preload()
                    ->required(),
                Forms\Components\Select::make('booking_id')
                    ->label('Réservation')
                    ->relationship('booking', 'id'),
                Forms\Components\Textarea::make('last_message')
                    ->label('Dernier message')
                    ->columnSpanFull(),
                Forms\Components\DateTimePicker::make('last_message_at')
                    ->label('Envoyé le'),
            ]);
    }

    /**
     * Fil de discussion en lecture (messages échangés).
     */
    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Participants')
                    ->schema([
                        TextEntry::make('client.name')
                            ->label('Client')
                            ->placeholder('—'),
                        TextEntry::make('agent.name')
                            ->label('Intervenant')
                            ->placeholder('—'),
                        TextEntry::make('booking.id')
                            ->label('Réservation liée')
                            ->placeholder('Aucune'),
                        TextEntry::make('created_at')
                            ->label('Discussion démarrée le')
                            ->dateTime('d/m/Y H:i'),
                    ])->columns(3),
                Section::make('Messages')
                    ->schema([
                        RepeatableEntry::make('messages')
                            ->label('')
                            ->schema([
                                TextEntry::make('sender.name')
                                    ->label('')
                                    ->weight('bold')
                                    ->formatStateUsing(fn ($state, $record) => $state ?? $record->sender?->email ?? 'Utilisateur supprimé'),
                                TextEntry::make('created_at')
                                    ->label('')
                                    ->dateTime('d/m/Y H:i')
                                    ->color('gray'),
                                TextEntry::make('message')
                                    ->label('')
                                    ->columnSpanFull(),
                            ])
                            ->columns(2)
                            ->contained(false),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('client.name')
                    ->label('Client')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('agent.name')
                    ->label('Intervenant')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('booking.id')
                    ->label('Réservation')
                    ->sortable(),
                Tables\Columns\TextColumn::make('last_message')
                    ->label('Dernier message')
                    ->limit(50)
                    ->searchable(),
                Tables\Columns\TextColumn::make('last_message_at')
                    ->label('Le')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('last_message_at', 'desc')
            ->groups([
                Group::make('client.name')
                    ->label('Client')
                    ->collapsible(),
                Group::make('agent.name')
                    ->label('Intervenant')
                    ->collapsible(),
            ])
            ->defaultGroup('client.name')
            ->filters([
                //
            ])
            ->actions([
                ViewAction::make(),
                DeleteAction::make(),
            ])
            ->bulkActions([
                // Tables\Actions\BulkActionGroup::make([
                //     Tables\Actions\DeleteBulkAction::make(),
                // ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListConversations::route('/'),
            'create' => Pages\CreateConversation::route('/create'),
            'view' => Pages\ViewConversation::route('/{record}'),
            'edit' => Pages\EditConversation::route('/{record}/edit'),
        ];
    }
}
