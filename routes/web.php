<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\Agent\DashboardController as AgentDashboardController;
use App\Http\Controllers\Agent\DocumentController;
use App\Http\Controllers\Agent\MissionController as AgentMissionController;
use App\Http\Controllers\Agent\RCPAcceptanceController;
use App\Http\Controllers\Agent\ReviewController;
use App\Http\Controllers\Agent\WalletController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\Client\InvoiceController;
use App\Http\Controllers\Client\MissionController as ClientMissionController;
use App\Http\Controllers\Client\PaymentController as ClientPaymentController;
use App\Http\Controllers\Client\PropertyController as ClientPropertyController;
use App\Http\Controllers\Client\QuoteController as ClientQuoteController;
use App\Http\Controllers\Client\ServiceRequestController as ClientServiceRequestController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MissionReturnController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfessionalController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Models\AgentProfile;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::get('/', function () {
    $availableAgentsCount = AgentProfile::query()
        ->verified()
        ->available()
        ->where(function ($query) {
            $query->where('is_banned', false)->orWhereNull('is_banned');
        })
        ->where(function ($query) {
            $query->whereNull('suspended_until')
                ->orWhere('suspended_until', '<=', now());
        })
        ->count();

    return inertia('Welcome', [
        'availableAgentsCount' => $availableAgentsCount,
    ]);
})->name('home');

// Agents & Search (Public)
Route::get('/search', [SearchController::class, 'index'])->name('agents.index');
Route::get('/agents/{agent}', [AgentController::class, 'show'])->name('agents.show');

// Services (public)
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');

// Professionals landing page (public)
Route::get('/professionnels', [ProfessionalController::class, 'index'])->name('professionals.index');
Route::post('/professionnels/inscription', [ProfessionalController::class, 'register'])->name('professionals.register');

// Legal pages (public)
Route::get('/mentions-legales', function () {
    return inertia('LegalNotice');
})->name('legal.notice');

Route::get('/confidentialite', function () {
    return inertia('Privacy');
})->name('privacy');

Route::get('/a-propos', function () {
    return inertia('About');
})->name('about');

Route::get('/contact', function () {
    return inertia('Contact');
})->name('contact.index');

Route::get('/sitemap.xml', function () {
    $urls = [
        ['loc' => route('home'), 'changefreq' => 'weekly', 'priority' => '1.0'],
        ['loc' => route('about'), 'changefreq' => 'monthly', 'priority' => '0.8'],
        ['loc' => route('contact.index'), 'changefreq' => 'monthly', 'priority' => '0.8'],
        ['loc' => route('register'), 'changefreq' => 'monthly', 'priority' => '0.8'],
        ['loc' => route('login'), 'changefreq' => 'monthly', 'priority' => '0.6'],
        ['loc' => route('professionals.index'), 'changefreq' => 'monthly', 'priority' => '0.7'],
        ['loc' => route('legal.notice'), 'changefreq' => 'yearly', 'priority' => '0.3'],
        ['loc' => route('privacy'), 'changefreq' => 'yearly', 'priority' => '0.3'],
    ];

    return response()
        ->view('sitemap', ['urls' => $urls])
        ->header('Content-Type', 'application/xml');
})->name('sitemap');

Route::post('/contact', [ContactController::class, 'send'])->name('contact.send');

// Google OAuth routes
Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {

    // Common dashboard (redirects based on role)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile & Settings
    Route::get('/settings/profile', [ProfileController::class, 'edit'])->name('settings.profile.edit');
    Route::patch('/settings/profile', [ProfileController::class, 'update'])->name('settings.profile.update');
    Route::delete('/settings/profile', [ProfileController::class, 'destroy'])->name('settings.profile.destroy');

    Route::get('/settings/password', [PasswordController::class, 'edit'])->name('settings.password.edit');
    Route::put('/settings/password', [PasswordController::class, 'update'])->name('settings.password.update');

    Route::get('/settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('settings.appearance.edit');

    Route::get('/settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])->name('settings.two-factor.show');

    // Notifications (shared by all authenticated users)
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/{id}/open', [NotificationController::class, 'open'])->name('notifications.open');
    Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Messages (shared by clients and agents)
    Route::get('/messages', [ConversationController::class, 'index'])->name('messages.index');
    Route::post('/messages/mission/{mission}', [ConversationController::class, 'forMission'])->name('messages.mission');
    Route::get('/messages/{conversation}', [ConversationController::class, 'show'])
        ->name('messages.show')
        ->missing(fn () => redirect()->route('notifications.index')->with('info', 'Cette conversation n\'est plus disponible.'));
    Route::post('/messages', [ConversationController::class, 'store'])->name('messages.store');
    Route::post('/messages/{conversation}/send', [ConversationController::class, 'sendMessage'])->name('messages.send');

    // Client routes
    Route::middleware(['role:client'])->prefix('client')->name('client.')->group(function () {
        // Legacy booking routes
        Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/create', [BookingController::class, 'create'])->name('bookings.create');
        Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
        Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
        Route::patch('/bookings/{booking}', [BookingController::class, 'update'])->name('bookings.update');
        Route::delete('/bookings/{booking}', [BookingController::class, 'destroy'])->name('bookings.destroy');
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');

        // VIMAIZ - Logements (Properties)
        Route::get('/properties', [ClientPropertyController::class, 'index'])->name('properties.index');
        Route::get('/properties/create', [ClientPropertyController::class, 'create'])->name('properties.create');
        Route::post('/properties', [ClientPropertyController::class, 'store'])->name('properties.store');
        Route::get('/properties/{property}', [ClientPropertyController::class, 'show'])->name('properties.show');
        Route::get('/properties/{property}/edit', [ClientPropertyController::class, 'edit'])->name('properties.edit');
        Route::patch('/properties/{property}', [ClientPropertyController::class, 'update'])->name('properties.update');
        Route::delete('/properties/{property}', [ClientPropertyController::class, 'destroy'])->name('properties.destroy');

        // VIMAIZ - Demandes de ménage (Service Requests)
        Route::get('/requests', [ClientServiceRequestController::class, 'index'])->name('requests.index');
        Route::get('/requests/create', [ClientServiceRequestController::class, 'create'])->name('requests.create');
        Route::post('/requests', [ClientServiceRequestController::class, 'store'])->name('requests.store');
        Route::get('/requests/{serviceRequest}', [ClientServiceRequestController::class, 'show'])
            ->name('requests.show')
            ->missing(fn () => redirect()->route('notifications.index')->with('info', 'Cette demande n\'est plus disponible.'));
        Route::post('/requests/{serviceRequest}/cancel', [ClientServiceRequestController::class, 'cancel'])->name('requests.cancel');
        Route::post('/requests/estimate', [ClientServiceRequestController::class, 'estimate'])->name('requests.estimate');

        // VIMAIZ - Devis (Quotes)
        Route::get('/quotes/{quote}', [ClientQuoteController::class, 'show'])
            ->name('quotes.show')
            ->missing(fn () => redirect()->route('notifications.index')->with('info', 'Ce devis n\'est plus disponible.'));
        Route::post('/quotes/{quote}/accept', [ClientQuoteController::class, 'accept'])
            ->name('quotes.accept')
            ->missing(fn () => redirect()->route('notifications.index')->with('info', 'Ce devis n\'est plus disponible.'));
        Route::post('/quotes/{quote}/refuse', [ClientQuoteController::class, 'refuse'])
            ->name('quotes.refuse')
            ->missing(fn () => redirect()->route('notifications.index')->with('info', 'Ce devis n\'est plus disponible.'));

        // VIMAIZ - Paiement (Payment)
        Route::get('/payment/return', [ClientPaymentController::class, 'return'])->name('payment.return');
        Route::get('/payment/{quote}', [ClientPaymentController::class, 'show'])->name('payment.show');
        Route::post('/payment/{quote}/process', [ClientPaymentController::class, 'process'])->name('payment.process');

        // VIMAIZ - Missions
        Route::get('/missions', [ClientMissionController::class, 'index'])->name('missions.index');
        Route::get('/missions/{mission}', [ClientMissionController::class, 'show'])
            ->name('missions.show')
            ->missing(fn () => redirect()->route('notifications.index')->with('info', 'Cette intervention n\'est plus disponible.'));
        Route::post('/missions/{mission}/review', [ClientMissionController::class, 'storeReview'])->name('missions.review');

        // VIMAIZ - Retours mécontentement (Client)
        Route::post('/missions/{mission}/return-request', [MissionReturnController::class, 'requestReturn'])->name('missions.return-request');
        Route::post('/missions/{mission}/return-validate', [MissionReturnController::class, 'validateReturn'])->name('missions.return-validate');

        // VIMAIZ - Factures (Invoices)
        Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
        Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
        Route::get('/invoices/{invoice}/download', [InvoiceController::class, 'download'])->name('invoices.download');

        // Addresses
        Route::get('/addresses', function () {
            return Inertia::render('client/addresses/index', [
                'addresses' => request()->user()->addresses()->orderBy('is_default', 'desc')->get(),
            ]);
        })->name('addresses.index');

        Route::post('/addresses', [AddressController::class, 'store'])->name('addresses.store');
        Route::put('/addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
        Route::delete('/addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');
    });

    // Agent routes
    Route::middleware(['role:agent'])->prefix('agent')->name('agent.')->group(function () {
        // VIMAIZ - Dashboard Agent
        Route::get('/dashboard', [AgentDashboardController::class, 'index'])->name('dashboard');

        // VIMAIZ - Missions Agent
        Route::get('/missions', [AgentMissionController::class, 'index'])->name('missions.index');
        Route::get('/missions/{mission}', [AgentMissionController::class, 'show'])
            ->name('missions.show')
            ->missing(fn () => redirect()->route('notifications.index')->with('info', 'Cette intervention n\'est plus disponible.'));
        Route::post('/missions/{mission}/accept', [AgentMissionController::class, 'accept'])->name('missions.accept');
        Route::post('/missions/{mission}/refuse', [AgentMissionController::class, 'refuse'])->name('missions.refuse');
        Route::post('/missions/{mission}/start', [AgentMissionController::class, 'start'])->name('missions.start');
        Route::post('/missions/{mission}/photos', [AgentMissionController::class, 'uploadPhoto'])->name('missions.upload-photo');
        Route::delete('/missions/{mission}/photos/{photo}', [AgentMissionController::class, 'deletePhoto'])->name('missions.delete-photo');
        Route::post('/missions/{mission}/complete', [AgentMissionController::class, 'complete'])->name('missions.complete');
        Route::get('/missions/{mission}/invoice', [AgentMissionController::class, 'downloadInvoice'])->name('missions.invoice');
        Route::patch('/missions/{mission}/checklist', [AgentMissionController::class, 'updateChecklist'])->name('missions.checklist');

        // VIMAIZ - Wallet Agent
        Route::get('/wallet', [WalletController::class, 'index'])->name('wallet.index');
        Route::put('/wallet/bank-details', [WalletController::class, 'updateBankDetails'])->name('wallet.bank-details');
        Route::post('/wallet/withdraw', [WalletController::class, 'withdraw'])->name('wallet.withdraw');

        // VIMAIZ - Documents Agent
        Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
        Route::post('/documents/{type}/upload', [DocumentController::class, 'upload'])->name('documents.upload');
        Route::delete('/documents/{type}', [DocumentController::class, 'destroy'])->name('documents.destroy');
        Route::post('/documents/submit', [DocumentController::class, 'submitForVerification'])->name('documents.submit');

        // VIMAIZ - Avis/Notes Agent
        Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');

        // VIMAIZ - Clause RCP
        Route::get('/rcp-acceptance', [RCPAcceptanceController::class, 'index'])->name('rcp-acceptance');
        Route::post('/rcp-acceptance', [RCPAcceptanceController::class, 'store'])->name('rcp-acceptance.store');

        // VIMAIZ - Retours mécontentement (Agent)
        Route::get('/returns', [MissionReturnController::class, 'agentReturns'])->name('returns.index');
        Route::post('/missions/{mission}/return-start', [MissionReturnController::class, 'startReturn'])->name('missions.return-start');
        Route::post('/missions/{mission}/return-complete', [MissionReturnController::class, 'completeReturn'])->name('missions.return-complete');

        // Legacy booking routes (keeping for compatibility)
        Route::get('/bookings', [BookingController::class, 'agentBookings'])->name('bookings.index');
        Route::patch('/bookings/{booking}/accept', [BookingController::class, 'accept'])->name('bookings.accept');
        Route::patch('/bookings/{booking}/reject', [BookingController::class, 'reject'])->name('bookings.reject');
        Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus'])->name('bookings.status');
    });

    // Admin routes (Filament handles most admin routes)
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        // Custom admin routes if needed
    });
});

// Services (public)
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');
