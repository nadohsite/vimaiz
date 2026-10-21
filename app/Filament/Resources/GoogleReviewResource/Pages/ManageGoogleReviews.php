<?php

namespace App\Filament\Resources\GoogleReviewResource\Pages;

use App\Filament\Resources\GoogleReviewResource;
use App\Models\GoogleReviewSummary;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ManageRecords;

class ManageGoogleReviews extends ManageRecords
{
    protected static string $resource = GoogleReviewResource::class;

    public function getSubheading(): ?string
    {
        $summary = GoogleReviewSummary::current();

        if ($summary->rating === null) {
            return 'Note globale Google non renseignée (elle ne s\'affiche pas sur le site).';
        }

        return 'Note globale affichée sur le site : '
            . number_format((float) $summary->rating, 1, ',', ' ') . '/5 ('
            . (int) $summary->rating_count . ' avis)';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('editGoogleSummary')
                ->label('Note globale Google')
                ->icon('heroicon-o-star')
                ->color('gray')
                ->modalHeading('Note globale de la fiche Google')
                ->modalDescription('Recopiez la note moyenne et le nombre total d\'avis affichés sur votre fiche Google. Laissez vide pour ne pas l\'afficher.')
                ->fillForm(function () {
                    $summary = GoogleReviewSummary::current();

                    return [
                        'google_rating' => $summary->rating,
                        'google_rating_count' => $summary->rating_count,
                        'google_maps_url' => $summary->google_maps_url,
                    ];
                })
                ->schema([
                    Forms\Components\TextInput::make('google_rating')
                        ->label('Note moyenne (ex. 4,9)')
                        ->numeric()
                        ->minValue(1)
                        ->maxValue(5)
                        ->step(0.1),
                    Forms\Components\TextInput::make('google_rating_count')
                        ->label('Nombre total d\'avis')
                        ->numeric()
                        ->integer()
                        ->minValue(0),
                    Forms\Components\TextInput::make('google_maps_url')
                        ->label('Lien vers la fiche Google (optionnel)')
                        ->url()
                        ->maxLength(1024),
                ])
                ->action(function (array $data) {
                    GoogleReviewSummary::current()->update([
                        'rating' => filled($data['google_rating']) ? (float) str_replace(',', '.', $data['google_rating']) : null,
                        'rating_count' => filled($data['google_rating_count']) ? (int) $data['google_rating_count'] : null,
                        'google_maps_url' => $data['google_maps_url'] ?: null,
                    ]);

                    Notification::make()->title('Note globale enregistrée')->success()->send();
                }),
            CreateAction::make()->label('Ajouter un avis'),
        ];
    }
}
