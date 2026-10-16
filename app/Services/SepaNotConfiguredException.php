<?php

namespace App\Services;

/**
 * Levée quand l'identité bancaire de Vimaiz (SEPA_CREDITOR_NAME /
 * SEPA_CREDITOR_IBAN) n'est pas renseignée dans .env. Volontairement
 * distincte d'une exception générique pour que l'action d'export affiche
 * un message clair plutôt qu'un plantage.
 */
class SepaNotConfiguredException extends \RuntimeException {}
