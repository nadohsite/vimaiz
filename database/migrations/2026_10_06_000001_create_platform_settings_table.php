<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Table "singleton" : une seule ligne, lue/écrite via
     * App\Models\PlatformSetting::current(). Regroupe les informations de
     * la plateforme modifiables depuis Admin > Paramètres : identité
     * publique, coordonnées de contact affichées sur le site, et identité
     * bancaire de Vimaiz utilisée pour générer les virements groupés SEPA.
     */
    public function up(): void
    {
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();

            // Identité de la plateforme
            $table->string('company_name')->default('VIMAIZ');

            // Contact public (affiché sur la page Contact et utilisé comme
            // adresse de réception du formulaire de contact)
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_hours')->nullable();
            $table->text('contact_address')->nullable();

            // Identité bancaire de VIMAIZ elle-même (pas celle des
            // intervenants), utilisée pour générer le fichier de virements
            // groupés SEPA (Admin > Finances > Demandes de retrait)
            $table->string('sepa_creditor_name')->nullable();
            $table->string('sepa_creditor_iban')->nullable();
            $table->string('sepa_creditor_bic')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
    }
};
