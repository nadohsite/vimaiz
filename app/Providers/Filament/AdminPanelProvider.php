<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Navigation\NavigationGroup;
use Filament\Support\Colors\Color;
use Filament\Support\Enums\Width;
use Illuminate\Support\HtmlString;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->colors([
                'primary' => Color::Sky,
                'danger' => Color::Rose,
                'success' => Color::Emerald,
                'warning' => Color::Amber,
                'info' => Color::Sky,
            ])
            ->brandName('Vimaiz Admin')
            ->brandLogo(asset('vimaiz-logo.png'))
            ->darkModeBrandLogo(asset('vimaiz-logo.png'))
            ->brandLogoHeight('3.25rem')
            ->favicon(asset('favicon.svg'))
            ->sidebarCollapsibleOnDesktop()
            ->sidebarWidth('18rem')
            ->maxContentWidth(Width::Full)
            ->navigationGroups([
                NavigationGroup::make('Demandes & Interventions')->collapsible(false),
                NavigationGroup::make('Clients'),
                NavigationGroup::make('Gestion Utilisateurs'),
                NavigationGroup::make('Finances'),
                NavigationGroup::make('Gestion des Services'),
                NavigationGroup::make('Gestion des Réservations'),
                NavigationGroup::make('Communication'),
                NavigationGroup::make('Gestion des Avis'),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Pages\Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                \App\Filament\Widgets\StatsOverviewWidget::class,
                \App\Filament\Widgets\LatestRequestsWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ])
            ->renderHook(
                'panels::head.end',
                fn () => new HtmlString(<<<'HTML'
<style>
    img.fi-logo, .fi-logo {
        filter: brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(166deg) brightness(98%) contrast(101%);
    }

    /* Menu admin plus lisible / tactile */
    .fi-sidebar-nav-item-button {
        min-height: 2.75rem !important;
        padding-top: 0.55rem !important;
        padding-bottom: 0.55rem !important;
        border-radius: 0.75rem !important;
        font-size: 0.95rem !important;
    }
    .fi-sidebar-nav-item-label {
        font-size: 0.95rem !important;
        font-weight: 500 !important;
    }
    .fi-sidebar-group-label {
        font-size: 0.7rem !important;
        letter-spacing: 0.06em !important;
        text-transform: uppercase !important;
        opacity: 0.7;
        margin-top: 0.75rem;
    }
    .fi-sidebar-header {
        padding-top: 1rem !important;
        padding-bottom: 1rem !important;
    }

    /* Mobile: contenu et boutons plus confortables */
    @media (max-width: 768px) {
        .fi-main, .fi-page-content {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
        }
        .fi-header-heading {
            font-size: 1.35rem !important;
            line-height: 1.3 !important;
        }
        .fi-ta-ctn {
            border-radius: 0.85rem !important;
        }
        .fi-btn {
            min-height: 2.5rem !important;
        }
        .fi-wi-stats-overview-stat {
            padding: 1rem !important;
        }
    }
</style>
HTML)
            );
    }
}
