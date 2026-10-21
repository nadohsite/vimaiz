<?php

namespace App\Services;

use RuntimeException;

class GooglePlacesNotConfiguredException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct(
            'Google Places n\'est pas configuré : renseignez GOOGLE_PLACES_API_KEY et GOOGLE_PLACE_ID dans le fichier .env.'
        );
    }
}
