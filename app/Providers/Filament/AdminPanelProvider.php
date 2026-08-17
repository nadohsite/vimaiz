<?php

namespace App\Providers\Filament;

use App\Filament\Livewire\AdminDatabaseNotifications;
use App\Filament\Widgets\LatestRequestsWidget;
use App\Filament\Widgets\StatsOverviewWidget;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Support\Enums\Width;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\HtmlString;
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
            ->brandLogoHeight('5rem')
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
                StatsOverviewWidget::class,
                LatestRequestsWidget::class,
            ])
            ->databaseNotifications(
                livewireComponent: AdminDatabaseNotifications::class,
            )
            ->databaseNotificationsPolling('15s')
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
                'panels::head.start',
                fn () => new HtmlString('<meta name="robots" content="noindex, nofollow">')
            )
            ->renderHook(
                'panels::head.end',
                fn () => new HtmlString(<<<'HTML'
<style>
    img.fi-logo, .fi-logo, .fi-sidebar-header img, .fi-logo img {
        height: 5rem !important;
        width: auto !important;
        max-height: none !important;
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
        min-height: 6.5rem !important;
        padding-top: 1.15rem !important;
        padding-bottom: 1.15rem !important;
    }

    /* Carte Bien (même rendu que /agent/missions) */
    .vimaiz-bien { display: block; }
    .vimaiz-bien-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        border: 1px solid #e2e8f0;
        border-radius: 0.75rem;
        background: #fff;
        padding: 1.5rem 0;
    }
    .vimaiz-bien-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 1.5rem;
        font-size: 1rem;
        font-weight: 600;
        line-height: 1.25;
        color: #0f172a;
    }
    .vimaiz-bien-body { padding: 1.5rem 1.5rem 0; }
    .vimaiz-bien-name { margin: 0; font-weight: 500; color: #0f172a; }
    .vimaiz-bien-muted { margin: 0; font-size: 0.875rem; color: #64748b; }
    .vimaiz-bien-type { margin-top: 0.125rem; }
    .vimaiz-bien-address { display: flex; align-items: center; gap: 0.25rem; margin-top: 0.25rem; }
    .vimaiz-bien-icon, .vimaiz-bien-pin {
        width: 1rem; height: 1rem; flex-shrink: 0; color: #0ea5e9;
    }
    .vimaiz-bien-pin { width: 0.75rem; height: 0.75rem; color: #64748b; }
    .vimaiz-bien-chars { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
    .vimaiz-bien-chars-title {
        margin: 0 0 0.75rem;
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #64748b;
    }
    .vimaiz-bien-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    @media (min-width: 768px) {
        .vimaiz-bien-grid { grid-template-columns: 1fr 1fr 1fr; }
    }
    .vimaiz-bien-tile {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: 1px solid #f1f5f9;
        background: #f8fafc;
    }
    .vimaiz-bien-tile-label { margin: 0; font-size: 0.75rem; color: #64748b; }
    .vimaiz-bien-tile-value { margin: 0; font-size: 0.875rem; font-weight: 500; color: #0f172a; }
    .vimaiz-bien-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
    }
    .vimaiz-bien-row:last-child { margin-bottom: 0; }
    .dark .vimaiz-bien-card, html.dark .vimaiz-bien-card {
        border-color: #334155;
        background: #1e293b;
    }
    .dark .vimaiz-bien-header, html.dark .vimaiz-bien-header,
    .dark .vimaiz-bien-name, html.dark .vimaiz-bien-name,
    .dark .vimaiz-bien-tile-value, html.dark .vimaiz-bien-tile-value { color: #fff; }
    .dark .vimaiz-bien-muted, html.dark .vimaiz-bien-muted,
    .dark .vimaiz-bien-chars-title, html.dark .vimaiz-bien-chars-title,
    .dark .vimaiz-bien-tile-label, html.dark .vimaiz-bien-tile-label { color: #94a3b8; }
    .dark .vimaiz-bien-icon, html.dark .vimaiz-bien-icon { color: #38bdf8; }
    .dark .vimaiz-bien-chars, html.dark .vimaiz-bien-chars { border-top-color: #475569; }
    .dark .vimaiz-bien-tile, html.dark .vimaiz-bien-tile {
        border-color: #475569;
        background: #334155;
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
