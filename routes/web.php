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

    // Client routes
    Route::middleware(['role:client'])->prefix('client')->name('client.')->group(function () {
        Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/create', [BookingController::class, 'create'])->name('bookings.create');
        Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
        Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
        Route::patch('/bookings/{booking}', [BookingController::class, 'update'])->name('bookings.update');
        Route::delete('/bookings/{booking}', [BookingController::class, 'destroy'])->name('bookings.destroy');
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');

        // Addresses
        Route::get('/addresses', function () {
            // We can return the Inertia page directly here or use a Controller method
            // Ideally, we should use AddressController@index but it returns JSON in my previous implementation?
            // Let's check AddressController content again. 
            // Wait, AddressController@index returns the collection directly (JSON API style) OR typically in Inertia apps we render a page.
            // Let's create a Client/Addresses/Index page and pass addresses as prop.
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
        Route::get('/dashboard', [DashboardController::class, 'agentDashboard'])->name('dashboard');
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
