<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Note moyenne et nombre total d'avis de la fiche Google Vimaiz, recopiés à la
 * main dans Admin > Avis Google. Une seule ligne : toujours passer par current().
 */
class GoogleReviewSummary extends Model
{
    protected $table = 'google_review_summary';

    protected $fillable = [
        'rating',
        'rating_count',
        'google_maps_url',
    ];

    protected $casts = [
        'rating' => 'float',
        'rating_count' => 'integer',
    ];

    public static function current(): self
    {
        return static::query()->first() ?? static::create([]);
    }
}
