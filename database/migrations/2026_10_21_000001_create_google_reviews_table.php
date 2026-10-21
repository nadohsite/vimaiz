<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Avis Google de la fiche Vimaiz, recopiés à la main depuis Google Business
     * dans Admin > Gestion des Avis > Avis Google. Seuls les avis 4 et 5 étoiles
     * visibles sont affichés sur la page d'accueil. La note moyenne et le nombre
     * total d'avis de la fiche sont saisis dans platform_settings.
     */
    public function up(): void
    {
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

        Schema::table('platform_settings', function (Blueprint $table) {
            $table->decimal('google_rating', 2, 1)->nullable();
            $table->unsignedInteger('google_rating_count')->nullable();
            $table->string('google_maps_url', 1024)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('google_reviews');

        Schema::table('platform_settings', function (Blueprint $table) {
            $table->dropColumn(['google_rating', 'google_rating_count', 'google_maps_url']);
        });
    }
};
