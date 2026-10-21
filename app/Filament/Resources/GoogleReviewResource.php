<?php

namespace App\Filament\Resources;

use App\Filament\Resources\GoogleReviewResource\Pages;
use App\Models\GoogleReview;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use UnitEnum;

/**
 * Avis Google recopiés à la main depuis Google Business, affichés dans le
 * bandeau « Ce que disent nos clients » de la page d'accueil.
 */
class GoogleReviewResource extends Resource
{
    protected static ?string $model = GoogleReview::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-star';

    protected static string|UnitEnum|null $navigationGroup = 'Gestion des Avis';

    protected static ?string $navigationLabel = 'Avis Google';

    protected static ?string $modelLabel = 'avis Google';

    protected static ?string $pluralModelLabel = 'Avis Google';

    protected static ?int $navigationSort = 51;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\TextInput::make('author_name')
                    ->label('Nom affiché sur Google')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Select::make('rating')
                    ->label('Note')
                    ->options([
                        5 => '★★★★★  5 étoiles',
                        4 => '★★★★☆  4 étoiles',
                    ])
                    ->default(5)
                    ->required(),
                Forms\Components\DatePicker::make('published_at')
                    ->label('Date de l\'avis')
                    ->helperText('Seuls le mois et l\'année sont affichés sur le site.')
                    ->default(now())
                    ->maxDate(now()),
                Forms\Components\Toggle::make('is_visible')
                    ->label('Afficher sur le site')
                    ->default(true)
                    ->inline(false),
                Forms\Components\Textarea::make('text')
                    ->label('Texte de l\'avis (recopié tel quel)')
                    ->required()
                    ->rows(5)
                    ->columnSpanFull(),
            ])
            ->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('author_name')
                    ->label('Auteur')
                    ->searchable(),
                Tables\Columns\TextColumn::make('rating')
                    ->label('Note')
                    ->badge()
                    ->formatStateUsing(fn ($state): string => $state . '/5')
                    ->color(fn ($state): string => $state >= 5 ? 'success' : 'info')
                    ->sortable(),
                Tables\Columns\TextColumn::make('text')
                    ->label('Avis')
                    ->limit(90)
                    ->tooltip(fn ($record) => $record->text)
                    ->wrap()
                    ->searchable(),
                Tables\Columns\TextColumn::make('published_at')
                    ->label('Date')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\ToggleColumn::make('is_visible')
                    ->label('Affiché sur le site'),
            ])
            ->defaultSort('published_at', 'desc')
            ->filters([
                Tables\Filters\TernaryFilter::make('is_visible')
                    ->label('Affiché sur le site'),
            ])
            ->actions([
                EditAction::make()->label('Modifier'),
                DeleteAction::make()->label('Supprimer'),
            ])
            ->bulkActions([])
            ->emptyStateHeading('Aucun avis Google pour l\'instant')
            ->emptyStateDescription('Cliquez sur « Ajouter un avis » et recopiez un avis 4 ou 5 étoiles depuis Google Business.');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageGoogleReviews::route('/'),
        ];
    }
}
