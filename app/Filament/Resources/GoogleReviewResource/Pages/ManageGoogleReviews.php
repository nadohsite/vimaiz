<?php

namespace App\Filament\Resources\GoogleReviewResource\Pages;

use App\Filament\Resources\GoogleReviewResource;
use App\Models\PlatformSetting;
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
        $settings = PlatformSetting::current();

        if ($settings->google_rating === null) {
            return 'Note globale Google non renseignée (elle ne s\'affiche pas sur le site).';
        }

        return 'Note globale affichée sur le site : '
            . number_format((float) $settings->google_rating, 1, ',', ' ') . '/5 ('
            . (int) $settings->google_rating_count . ' avis)';
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
                ->fillForm(fn () => [
                    'google_rating' => PlatformSetting::current()->google_rating,
                    'google_rating_count' => PlatformSetting::current()->google_rating_count,
                    'google_maps_url' => PlatformSetting::current()->google_maps_url,
                ])
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
                    PlatformSetting::current()->update([
                        'google_rating' => filled($data['google_rating']) ? (float) str_replace(',', '.', $data['google_rating']) : null,
                        'google_rating_count' => filled($data['google_rating_count']) ? (int) $data['google_rating_count'] : null,
                        'google_maps_url' => $data['google_maps_url'] ?: null,
                    ]);

                    Notification::make()->title('Note globale enregistrée')->success()->send();
                }),
            CreateAction::make()->label('Ajouter un avis'),
        ];
    }
}
