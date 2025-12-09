<?php

use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\AddressController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::get('/services/categories', [ServiceController::class, 'categories']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{id}', [ServiceController::class, 'show']);

Route::get('/agents', [AgentController::class, 'index']);
Route::get('/agents/{id}', [AgentController::class, 'show']);
Route::post('/agents/search-nearby', [AgentController::class, 'searchNearby']);
Route::get('/agents/{id}/reviews', [ReviewController::class, 'agentReviews']);

// Protected routes (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Agent routes
    Route::middleware(['role:agent'])->prefix('agent')->group(function () {
        Route::get('/profile', [AgentController::class, 'show']);
        Route::put('/profile', [AgentController::class, 'update']);
        Route::get('/statistics', [AgentController::class, 'statistics']);
        
        Route::put('/bookings/{id}/accept', [BookingController::class, 'accept']);
        Route::put('/bookings/{id}/reject', [BookingController::class, 'reject']);
        Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
        
        Route::post('/reviews/{id}/respond', [ReviewController::class, 'respond']);
    });
    
    // Client routes
    Route::middleware(['role:client'])->prefix('client')->group(function () {
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::post('/bookings/{id}/review', [ReviewController::class, 'store']);
        
        Route::apiResource('addresses', AddressController::class);
    });
    
    // Shared routes (client & agent)
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/upcoming', [BookingController::class, 'upcoming']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::put('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    
    Route::get('/reviews/{id}', [ReviewController::class, 'show']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/conversations/{id}/messages', [MessageController::class, 'messages']);
    Route::post('/conversations/{id}/messages', [MessageController::class, 'sendMessage']);
    Route::put('/messages/{id}/read', [MessageController::class, 'markAsRead']);
});
