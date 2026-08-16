<?php

namespace App\Support;

class PublicSeo
{
    /**
     * @return array{title: string, description: ?string}
     */
    public static function forComponent(?string $component): array
    {
        $appName = (string) config('app.name', 'VIMAIZ');

        $pages = [
            'Welcome' => [
                'title' => 'VIMAIZ — Dormez l\'esprit Tranquille',
                'description' => 'Dormez l\'esprit Tranquille. Vimaiz veille à ce que chacun de vos logements soit toujours prêt à accueillir les prochains voyageurs.',
            ],
            'auth/login' => [
                'title' => 'Connexion',
                'description' => 'Connectez-vous à votre espace VIMAIZ pour gérer vos logements, interventions et paiements.',
            ],
            'auth/register' => [
                'title' => 'Inscription',
                'description' => 'Créez votre compte VIMAIZ : inscrivez-vous comme propriétaire ou comme intervenant.',
            ],
            'Contact' => [
                'title' => 'Nous contacter — VIMAIZ',
                'description' => 'Une question ? Une suggestion ? Notre équipe est là pour vous répondre.',
            ],
            'About' => [
                'title' => 'À propos',
                'description' => 'Découvrez VIMAIZ, la plateforme qui simplifie l\'organisation des interventions pour vos locations saisonnières.',
            ],
            'Professionals' => [
                'title' => 'Devenir intervenant — Rejoindre le réseau Vimaiz',
                'description' => 'Rejoignez le réseau d\'intervenants VIMAIZ et recevez des propositions d\'interventions selon vos disponibilités.',
            ],
            'LegalNotice' => [
                'title' => 'Mentions Légales — VIMAIZ',
                'description' => 'Mentions légales du site VIMAIZ.',
            ],
            'Privacy' => [
                'title' => 'Politique de Confidentialité — VIMAIZ',
                'description' => 'Politique de confidentialité de VIMAIZ : collecte, utilisation et protection de vos données personnelles.',
            ],
        ];

        $meta = $pages[$component] ?? ['title' => null, 'description' => null];
        $pageTitle = $meta['title'];

        return [
            'title' => $pageTitle ? $pageTitle.' - '.$appName : $appName,
            'description' => $meta['description'],
        ];
    }
}
