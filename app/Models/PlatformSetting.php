<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Réglages "singleton" de la plateforme (une seule ligne en base),
 * modifiables depuis Admin > Paramètres. Toujours accéder via
 * PlatformSetting::current() plutôt que de créer un nouvel enregistrement
 * directement, pour garantir qu'il n'existe jamais qu'une seule ligne.
 */
class PlatformSetting extends Model
{
    protected $fillable = [
        'company_name',
        'contact_email',
        'contact_phone',
        'contact_hours',
        'contact_address',
        'sepa_creditor_name',
        'sepa_creditor_iban',
        'sepa_creditor_bic',
    ];

    /**
     * Retourne l'unique ligne de réglages, en la créant si besoin. À la
     * création, reprend les valeurs déjà présentes dans .env (si définies)
     * pour ne rien casser sur un serveur déjà configuré via les variables
     * d'environnement : la page Admin > Paramètres devient ensuite la
     * source de vérité.
     */
    public static function current(): self
    {
        return static::query()->first() ?? static::create([
            'company_name' => config('services.sepa.creditor_name') ?: 'VIMAIZ',
            'sepa_creditor_name' => config('services.sepa.creditor_name'),
            'sepa_creditor_iban' => config('services.sepa.creditor_iban'),
            'sepa_creditor_bic' => config('services.sepa.creditor_bic'),
        ]);
    }
}
