<?php

namespace App\Filament\Resources\GoogleReviewResource\Pages;

use App\Filament\Resources\GoogleReviewResource;
use App\Models\PlatformSetting;
use App\Services\GooglePlacesNotConfiguredException;
use App\Services\GooglePlacesReviewService;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Facades\Log;
use Throwable;

class ListGoogleReviews extends ListRecords
{
    protected static string $resource = GoogleReviewResource::class;

    public function getSubheading(): ?string
    {
        $settings = PlatformSetting::current();

        if ($settings->google_reviews_fetched_at === null) {
            return 'Aucune récupération effectuée pour l\'instant.';
        }

        $summary = $settings->google_rating !== null
            ? number_format((float) $settings->google_rating, 1, ',', ' ') . '/5 sur Google ('
                . (int) $settings->google_rating_count . ' avis au total)'
            : 'Note Google indisponible';

        return $summary . ' · dernière récupération le '
            . $settings->google_reviews_fetched_at->timezone(config('app.timezone'))->format('d/m/Y à H:i');
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('fetchGoogleReviews')
                ->label('Récupérer les derniers avis')
                ->icon('heroicon-o-arrow-path')
                ->color('primary')
                ->requiresConfirmation()
                ->modalHeading('Récupérer les avis Google')
                ->modalDescription('Les avis 4 et 5 étoiles de la fiche Google Vimaiz seront importés ou mis à jour. Google renvoie au maximum 5 avis par récupération ; les avis déjà importés sont conservés.')
                ->modalSubmitActionLabel('Récupérer')
                ->action(function (GooglePlacesReviewService $service) {
                    try {
                        $stats = $service->fetch();
                    } catch (GooglePlacesNotConfiguredException $e) {
                        Notification::make()
                            ->title('Google Places non configuré')
                            ->body($e->getMessage())
                            ->danger()
                            ->persistent()
                            ->send();

                        return;
                    } catch (Throwable $e) {
                        Log::error('Récupération des avis Google échouée', ['error' => $e->getMessage()]);

                        Notification::make()
                            ->title('La récupération a échoué')
                            ->body($e->getMessage())
                            ->danger()
                            ->persistent()
                            ->send();

                        return;
                    }

                    Notification::make()
                        ->title('Avis Google récupérés')
                        ->body(sprintf(
                            '%d nouveau(x), %d mis à jour, %d ignoré(s) (moins de 4 étoiles) sur %d reçu(s).',
                            $stats['created'],
                            $stats['updated'],
                            $stats['ignored'],
                            $stats['received'],
                        ))
                        ->success()
                        ->send();
                }),
        ];
    }
}
