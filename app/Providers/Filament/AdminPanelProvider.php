<?php

namespace App\Providers\Filament;

use App\Filament\Livewire\VimaizDatabaseNotifications;
use Filament\Enums\DatabaseNotificationsPosition;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\MenuItem;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Navigation\NavigationGroup;
use Filament\Widgets;
use Filament\Support\Facades\FilamentView;
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
            ->brandName('VIMAIZ Admin')
            ->brandLogo(asset('vimaiz-logo.png'))
            ->darkModeBrandLogo(asset('vimaiz-logo.png'))
            ->brandLogoHeight('4.5rem')
            ->favicon(asset('favicon.svg'))
            ->sidebarCollapsibleOnDesktop()
            ->databaseNotifications(
                livewireComponent: VimaizDatabaseNotifications::class,
                position: DatabaseNotificationsPosition::Topbar,
            )
            ->databaseNotificationsPolling('15s')
            ->navigationGroups([
                NavigationGroup::make('Demandes & Missions'),
                NavigationGroup::make('Clients'),
                NavigationGroup::make('Gestion Utilisateurs'),
                NavigationGroup::make('Finance'),
                NavigationGroup::make('Configuration'),
                NavigationGroup::make('Service Management'),
                NavigationGroup::make('Booking Management'),
                NavigationGroup::make('Communication'),
                NavigationGroup::make('Review Management'),
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
            ->userMenuItems([
                'profile' => MenuItem::make()
                    ->label('Mon compte')
                    ->url(fn (): string => route('settings.profile.edit'))
                    ->icon('heroicon-o-user-circle'),
                MenuItem::make()
                    ->label('Mot de passe')
                    ->url(fn (): string => route('settings.password.edit'))
                    ->icon('heroicon-o-key')
                    ->sort(0),
            ])
            ->renderHook(
                'panels::head.end',
                fn () => new HtmlString('<style>img.fi-logo, .fi-logo { filter: brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(166deg) brightness(98%) contrast(101%); }</style>')
            )
            ->renderHook(
                'panels::body.end',
                fn () => view('filament.echo')
            );
    }
}
