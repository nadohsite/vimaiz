<?php

namespace App\Services;

/**
 * Levée quand aucune clé secrète Stripe (STRIPE_SECRET / CASHIER_SECRET) n'est
 * configurée. Volontairement distincte de Stripe\Exception\ApiErrorException
 * pour que les contrôleurs puissent l'attraper spécifiquement et afficher un
 * message clair plutôt qu'un plantage générique.
 */
class StripeConnectNotConfiguredException extends \RuntimeException {}
