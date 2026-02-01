<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AgentPayoutResource\Pages;
use App\Models\AgentPayout;
use BackedEnum;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use UnitEnum;

class AgentPayoutResource extends Resource
{
    protected static ?string $model = AgentPayout::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-banknotes';

    protected static string|UnitEnum|null $navigationGroup = 'Finance';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\TextInput::make('payout_number')
                    ->disabled()
                    ->dehydrated(false),
                Forms\Components\Select::make('agent_id')
                    ->relationship('agent', 'name')
                    ->required(),
                Forms\Components\DatePicker::make('period_start')
                    ->required(),
                Forms\Components\DatePicker::make('period_end')
                    ->required(),
                Forms\Components\TextInput::make('gross_amount')
                    ->numeric()
                    ->prefix('€')
                    ->required(),
                Forms\Components\TextInput::make('platform_commission')
                    ->numeric()
                    ->prefix('€')
                    ->required(),
                Forms\Components\TextInput::make('net_amount')
                    ->numeric()
                    ->prefix('€')
                    ->required(),
                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'processing' => 'Processing',
                        'completed' => 'Completed',
                        'failed' => 'Failed',
                    ])
                    ->required(),
                Forms\Components\DateTimePicker::make('processed_at'),
                Forms\Components\Textarea::make('failure_reason')
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('payout_number')
                    ->searchable(),
                Tables\Columns\TextColumn::make('agent.name')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('period_start')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('period_end')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('net_amount')
                    ->money('€')
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'processing' => 'info',
                        'completed' => 'success',
                        'failed' => 'danger',
                    }),
                Tables\Columns\TextColumn::make('processed_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'processing' => 'Processing',
                        'completed' => 'Completed',
                        'failed' => 'Failed',
                    ]),
            ])
            ->actions([
                // Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListAgentPayouts::route('/'),
            'create' => Pages\CreateAgentPayout::route('/create'),
            'edit' => Pages\EditAgentPayout::route('/{record}/edit'),
        ];
    }
}
