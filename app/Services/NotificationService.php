<?php

namespace App\Services;

use App\Models\CleaningRequest;
use App\Models\Mission;
use App\Models\Quote;
use App\Models\User;
use App\Notifications\MissionAssignedNotification;
use App\Notifications\MissionCompletedNotification;
use App\Notifications\NewCleaningRequestNotification;
use App\Notifications\NewQuoteNotification;
use App\Notifications\PaymentReceivedNotification;
use App\Notifications\QuoteAcceptedNotification;

class NotificationService
{
    /**
     * Notify admin(s) of a new cleaning request
     */
    public function notifyNewCleaningRequest(CleaningRequest $request): void
    {
        $admins = User::role('admin')->get();
        
        foreach ($admins as $admin) {
            $admin->notify(new NewCleaningRequestNotification($request));
        }
    }

    /**
     * Notify client when a quote is sent
     */
    public function notifyQuoteSent(Quote $quote): void
    {
        $quote->user->notify(new NewQuoteNotification($quote));
    }

    /**
     * Notify admin when a quote is accepted
     */
    public function notifyQuoteAccepted(Quote $quote): void
    {
        $admins = User::role('admin')->get();
        
        foreach ($admins as $admin) {
            $admin->notify(new QuoteAcceptedNotification($quote));
        }
    }

    /**
     * Notify all parties when payment is received
     */
    public function notifyPaymentReceived(Mission $mission): void
    {
        // Notify client
        $mission->client->notify(new PaymentReceivedNotification($mission));
        
        // Notify admin(s)
        $admins = User::role('admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new PaymentReceivedNotification($mission));
        }
    }

    /**
     * Notify agent and client when mission is assigned
     */
    public function notifyMissionAssigned(Mission $mission): void
    {
        // Notify agent
        if ($mission->agent) {
            $mission->agent->notify(new MissionAssignedNotification($mission));
        }
        
        // Notify client
        $mission->client->notify(new MissionAssignedNotification($mission));
    }

    /**
     * Notify client and admin when mission is completed
     */
    public function notifyMissionCompleted(Mission $mission): void
    {
        // Notify client
        $mission->client->notify(new MissionCompletedNotification($mission));
        
        // Notify admin(s)
        $admins = User::role('admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new MissionCompletedNotification($mission));
        }
    }
}
