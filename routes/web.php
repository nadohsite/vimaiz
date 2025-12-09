<?php

use App\Http\Controllers\AgentController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

Route::get('/search', [SearchController::class, 'index'])->name('search.index');
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/agents', [SearchController::class, 'index'])->name('agents.index');
Route::get('/agents/{id}', [AgentController::class, 'show'])->name('agents.show');

Route::middleware(['auth', config('jetstream.auth_session'), 'verified'])->group(function () {
    
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Booking Routes
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/create', [BookingController::class, 'create'])->name('bookings.create');
    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    
    // Payment Routes
    Route::post('/payment/create-intent', [\App\Http\Controllers\PaymentController::class, 'createPaymentIntent'])->name('payment.create-intent');
    Route::post('/payment/confirm', [\App\Http\Controllers\PaymentController::class, 'confirmPayment'])->name('payment.confirm');
    
    // Agent Routes
    Route::prefix('agent')->name('agent.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Agent\DashboardController::class, 'index'])->name('dashboard');
        
        Route::get('/bookings', [\App\Http\Controllers\Agent\BookingController::class, 'index'])->name('bookings');
        Route::post('/bookings/{booking}/accept', [\App\Http\Controllers\Agent\BookingController::class, 'accept'])->name('bookings.accept');
        Route::post('/bookings/{booking}/reject', [\App\Http\Controllers\Agent\BookingController::class, 'reject'])->name('bookings.reject');
        Route::post('/bookings/{booking}/complete', [\App\Http\Controllers\Agent\BookingController::class, 'complete'])->name('bookings.complete');
        
        Route::get('/wallet', [\App\Http\Controllers\Agent\WalletController::class, 'index'])->name('wallet');
        Route::post('/wallet/withdraw', [\App\Http\Controllers\Agent\WalletController::class, 'withdraw'])->name('wallet.withdraw');
    });
});

// Stripe Webhook (outside auth middleware, no CSRF)
Route::post('/stripe/webhook', [\App\Http\Controllers\WebhookController::class, 'handleStripeWebhook'])->name('stripe.webhook');
