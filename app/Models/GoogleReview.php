<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Avis Google réel de la fiche Vimaiz, recopié tel quel depuis Google Business
 * (Admin > Avis Google). Ne jamais inventer d'avis.
 */
class GoogleReview extends Model
{
    protected $fillable = [
        'author_name',
        'rating',
        'text',
        'published_at',
        'is_visible',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_visible' => 'boolean',
        'published_at' => 'date',
    ];

    /** Avis affichables sur la page d'accueil : visibles et 4 ou 5 étoiles. */
    public function scopeDisplayable(Builder $query): Builder
    {
        return $query->where('is_visible', true)->where('rating', '>=', 4);
    }
}
