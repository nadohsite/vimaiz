<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Avis Google de la fiche Vimaiz, recopiés à la main depuis Google Business
     * dans Admin > Gestion des Avis > Avis Google. Seuls les avis 4 et 5 étoiles
     * visibles sont affichés sur la page d'accueil.
     *
     * google_review_summary : une seule ligne, note moyenne et nombre total
     * d'avis de la fiche Google (indépendant de platform_settings).
     */
    public function up(): void
    {
        // Repart de tables propres si une tentative précédente les avait créées.
        Schema::dropIfExists('google_reviews');
        Schema::dropIfExists('google_review_summary');

        Schema::create('google_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('author_name');
            $table->unsignedTinyInteger('rating');
            $table->text('text');
            $table->date('published_at')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            $table->index(['is_visible', 'rating', 'published_at']);
        });

        Schema::create('google_review_summary', function (Blueprint $table) {
            $table->id();
            $table->decimal('rating', 2, 1)->nullable();
            $table->unsignedInteger('rating_count')->nullable();
            $table->string('google_maps_url', 1024)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('google_reviews');
        Schema::dropIfExists('google_review_summary');
    }
};
