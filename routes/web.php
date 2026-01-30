<?php

use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\Client\PropertyController as ClientPropertyController;
use App\Http\Controllers\Client\ServiceRequestController as ClientServiceRequestController;
use App\Http\Controllers\Client\QuoteController as ClientQuoteController;
use App\Http\Controllers\Client\PaymentController as ClientPaymentController;
use App\Http\Controllers\Client\MissionController as ClientMissionController;
use App\Http\Controllers\Agent\DashboardController as AgentDashboardController;
use App\Http\Controllers\Agent\MissionController as AgentMissionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::get('/', function () {
    return inertia('Welcome');
})->name('home');

// Agents & Search (Public)
Route::get('/search', [SearchController::class, 'index'])->name('agents.index');
Route::get('/agents/{agent}', [AgentController::class, 'show'])->name('agents.show');

// Services (public)
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');

// Professionals landing page (public)
Route::get('/professionnels', [\App\Http\Controllers\ProfessionalController::class, 'index'])->name('professionals.index');
Route::post('/professionnels/inscription', [\App\Http\Controllers\ProfessionalController::class, 'register'])->name('professionals.register');

// Legal pages (public)
Route::get('/mentions-legales', function () {
    return inertia('LegalNotice');
})->name('legal.notice');

Route::get('/confidentialite', function () {
    return inertia('Privacy');
})->name('privacy');

Route::get('/contact', function () {
    return inertia('Contact');
})->name('contact.index');

Route::post('/contact', [\App\Http\Controllers\ContactController::class, 'send'])->name('contact.send');

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
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/mark-read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Messages (shared by clients and agents)
    Route::get('/messages', [\App\Http\Controllers\ConversationController::class, 'index'])->name('messages.index');
    Route::get('/messages/{conversation}', [\App\Http\Controllers\ConversationController::class, 'show'])->name('messages.show');
    Route::post('/messages', [\App\Http\Controllers\ConversationController::class, 'store'])->name('messages.store');
    Route::post('/messages/{conversation}/send', [\App\Http\Controllers\ConversationController::class, 'sendMessage'])->name('messages.send');

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
        Route::get('/requests/{serviceRequest}', [ClientServiceRequestController::class, 'show'])->name('requests.show');
        Route::post('/requests/{serviceRequest}/cancel', [ClientServiceRequestController::class, 'cancel'])->name('requests.cancel');
        Route::post('/requests/estimate', [ClientServiceRequestController::class, 'estimate'])->name('requests.estimate');

        // VIMAIZ - Devis (Quotes)
        Route::get('/quotes/{quote}', [ClientQuoteController::class, 'show'])->name('quotes.show');
        Route::post('/quotes/{quote}/accept', [ClientQuoteController::class, 'accept'])->name('quotes.accept');
        Route::post('/quotes/{quote}/refuse', [ClientQuoteController::class, 'refuse'])->name('quotes.refuse');

        // VIMAIZ - Paiement (Payment)
        Route::get('/payment/{quote}', [ClientPaymentController::class, 'show'])->name('payment.show');
        Route::get('/payment/return', [ClientPaymentController::class, 'return'])->name('payment.return');
        Route::post('/payment/{quote}/process', [ClientPaymentController::class, 'process'])->name('payment.process');

        // VIMAIZ - Missions
        Route::get('/missions', [ClientMissionController::class, 'index'])->name('missions.index');
        Route::get('/missions/{mission}', [ClientMissionController::class, 'show'])->name('missions.show');
        Route::post('/missions/{mission}/review', [ClientMissionController::class, 'storeReview'])->name('missions.review');

        // VIMAIZ - Factures (Invoices)
        Route::get('/invoices', [\App\Http\Controllers\Client\InvoiceController::class, 'index'])->name('invoices.index');
        Route::get('/invoices/{invoice}', [\App\Http\Controllers\Client\InvoiceController::class, 'show'])->name('invoices.show');
        Route::get('/invoices/{invoice}/download', [\App\Http\Controllers\Client\InvoiceController::class, 'download'])->name('invoices.download');

        // Addresses
        Route::get('/addresses', function () {
            return Inertia::render('client/addresses/index', [
                'addresses' => request()->user()->addresses()->orderBy('is_default', 'desc')->get()
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
        Route::get('/missions/{mission}', [AgentMissionController::class, 'show'])->name('missions.show');
        Route::post('/missions/{mission}/accept', [AgentMissionController::class, 'accept'])->name('missions.accept');
        Route::post('/missions/{mission}/refuse', [AgentMissionController::class, 'refuse'])->name('missions.refuse');
        Route::post('/missions/{mission}/start', [AgentMissionController::class, 'start'])->name('missions.start');
        Route::post('/missions/{mission}/photos', [AgentMissionController::class, 'uploadPhoto'])->name('missions.upload-photo');
        Route::delete('/missions/{mission}/photos/{photo}', [AgentMissionController::class, 'deletePhoto'])->name('missions.delete-photo');
        Route::post('/missions/{mission}/complete', [AgentMissionController::class, 'complete'])->name('missions.complete');

        // VIMAIZ - Wallet Agent
        Route::get('/wallet', [\App\Http\Controllers\Agent\WalletController::class, 'index'])->name('wallet.index');
        Route::post('/wallet/withdraw', [\App\Http\Controllers\Agent\WalletController::class, 'withdraw'])->name('wallet.withdraw');

        // VIMAIZ - Documents Agent
        Route::get('/documents', [\App\Http\Controllers\Agent\DocumentController::class, 'index'])->name('documents.index');
        Route::post('/documents/{type}/upload', [\App\Http\Controllers\Agent\DocumentController::class, 'upload'])->name('documents.upload');
        Route::delete('/documents/{type}', [\App\Http\Controllers\Agent\DocumentController::class, 'destroy'])->name('documents.destroy');
        Route::post('/documents/submit', [\App\Http\Controllers\Agent\DocumentController::class, 'submitForVerification'])->name('documents.submit');

        // VIMAIZ - Avis/Notes Agent
        Route::get('/reviews', [\App\Http\Controllers\Agent\ReviewController::class, 'index'])->name('reviews.index');

        // VIMAIZ - Clause RCP
        Route::get('/rcp-acceptance', [\App\Http\Controllers\Agent\RCPAcceptanceController::class, 'index'])->name('rcp-acceptance');
        Route::post('/rcp-acceptance', [\App\Http\Controllers\Agent\RCPAcceptanceController::class, 'store'])->name('rcp-acceptance.store');

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
