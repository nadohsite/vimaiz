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

// Récapitulatif hebdomadaire des interventions — chaque lundi matin.
Schedule::command('vimaiz:send-weekly-recap')->weeklyOn(1, '09:00');

// Paiement différé 48h des brigades (Volet 7, décision du 15/10/2026) :
// libère vers le solde disponible des intervenants les paiements retenus
// depuis au moins 48h, sauf contestation ou retour rejeté en attente
// d'arbitrage admin. Toutes les heures pour rester proche de l'échéance
// réelle de 48h plutôt qu'une seule fois par jour.
Schedule::command('vimaiz:release-held-mission-payouts')->hourly();
