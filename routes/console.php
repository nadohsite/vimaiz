<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Relances d'engagement (profils incomplets, clients sans ménage planifié).
// La commande garantit max 1 relance par utilisateur toutes les 48h ;
// on l'exécute chaque jour à 10h pour attraper tous les utilisateurs éligibles.
Schedule::command('vimaiz:send-reminders')->dailyAt('10:00');
