<?php

use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {

    // User info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Search & Agents
    Route::post('/search/agents', [SearchController::class, 'searchAgents'])->name('api.search.agents');
    Route::get('/agents/{agent}', [SearchController::class, 'showAgent'])->name('api.agents.show');
    Route::get('/agents/{agent}/availability', [SearchController::class, 'getAvailability'])->name('api.agents.availability');

    // Bookings
    Route::apiResource('bookings', BookingController::class);
    Route::post('/bookings/{booking}/recurrence', [BookingController::class, 'createRecurrence'])->name('api.bookings.recurrence');

    // Chat
    Route::get('/conversations', [ChatController::class, 'index'])->name('api.conversations.index');
    Route::get('/conversations/{conversation}/messages', [ChatController::class, 'messages'])->name('api.conversations.messages');
    Route::post('/conversations/{conversation}/messages', [ChatController::class, 'sendMessage'])->name('api.conversations.send');
    Route::post('/conversations/{conversation}/messages/image', [ChatController::class, 'sendImage'])->name('api.conversations.image');

    // Payments
    Route::post('/payments/intent', [PaymentController::class, 'createIntent'])->name('api.payments.intent');
    Route::post('/payments/{booking}/confirm', [PaymentController::class, 'confirmPayment'])->name('api.payments.confirm');
    Route::post('/payments/{booking}/tip', [PaymentController::class, 'addTip'])->name('api.payments.tip');
    Route::get('/invoices', [PaymentController::class, 'invoices'])->name('api.invoices.index');
    Route::get('/invoices/{invoice}/download', [PaymentController::class, 'downloadInvoice'])->name('api.invoices.download');
});

// Stripe webhook (public, verified by Stripe signature)
Route::post('/webhooks/stripe', [\App\Http\Controllers\WebhookController::class, 'handleStripeWebhook'])->name('webhooks.stripe');
