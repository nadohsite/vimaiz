<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Platform Commission Rate
    |--------------------------------------------------------------------------
    |
    | The percentage of each booking that the platform takes as commission.
    | This is deducted from the agent's earnings.
    |
    */
    'commission_rate' => env('VIMAIZ_COMMISSION_RATE', 25), // 25% default

    /*
    |--------------------------------------------------------------------------
    | Booking Settings
    |--------------------------------------------------------------------------
    */
    'booking' => [
        // Minimum hours before a booking can be made
        'minimum_advance_hours' => 4,
        
        // Maximum days in advance a booking can be made
        'maximum_advance_days' => 90,
        
        // Cancellation deadline (hours before scheduled time)
        'cancellation_deadline_hours' => 24,
        
        // Auto-reject bookings if agent doesn't respond within (hours)
        'auto_reject_hours' => 24,
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Settings
    |--------------------------------------------------------------------------
    */
    'payment' => [
        // Currency
        'currency' => 'MAD',
        'currency_symbol' => 'DH',
        
        // Stripe settings
        'stripe_enabled' => env('STRIPE_ENABLED', true),
        
        // Payout schedule
        'payout_frequency' => 'weekly', // weekly, biweekly, monthly
        'payout_day' => 'monday', // Day of the week for weekly payouts
    ],

    /*
    |--------------------------------------------------------------------------
    | Review Settings
    |--------------------------------------------------------------------------
    */
    'reviews' => [
        // Auto-approve reviews or require moderation
        'auto_approve' => true,
        
        // Days after booking completion to leave a review
        'review_deadline_days' => 14,
    ],

    /*
    |--------------------------------------------------------------------------
    | Agent Settings
    |--------------------------------------------------------------------------
    */
    'agent' => [
        // Default service radius in kilometers
        'default_service_radius_km' => 10,
        
        // Maximum service radius
        'max_service_radius_km' => 50,
        
        // Require manual verification of agents
        'manual_verification' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Settings
    |--------------------------------------------------------------------------
    */
    'notifications' => [
        'email_enabled' => true,
        'sms_enabled' => env('SMS_ENABLED', false),
    ],
];
