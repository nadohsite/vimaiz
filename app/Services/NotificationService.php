<?php

namespace App\Services;

use App\Models\Mission;
use App\Models\Quote;
use App\Models\User;
use App\Notifications\MissionAssignedNotification;
use App\Notifications\MissionCompletedNotification;
use App\Notifications\NewQuoteNotification;
use App\Notifications\PaymentReceivedNotification;
use App\Notifications\QuoteAcceptedNotification;

class NotificationService
{
    public function notifyQuoteSent(Quote $quote): void
    {
        $quote->serviceRequest?->client?->notify(new NewQuoteNotification($quote));
    }

    public function notifyQuoteAccepted(Quote $quote): void
    {
        User::notifyAdmins(new QuoteAcceptedNotification($quote));
    }

    public function notifyPaymentReceived(Mission $mission): void
    {
        $mission->client->notify(new PaymentReceivedNotification($mission));
        User::notifyAdmins(new PaymentReceivedNotification($mission));
    }

    public function notifyMissionAssigned(Mission $mission): void
    {
        if ($mission->agent) {
            $mission->agent->notify(new MissionAssignedNotification($mission));
        }
    }

    public function notifyMissionCompleted(Mission $mission): void
    {
        $mission->client->notify(new MissionCompletedNotification($mission));
        User::notifyAdmins(new MissionCompletedNotification($mission));
    }
}
