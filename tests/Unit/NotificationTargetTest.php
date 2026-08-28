<?php

namespace Tests\Unit;

use App\Models\Quote;
use App\Models\User;
use App\Notifications\NewQuoteNotification;
use App\Support\NotificationTarget;
use Tests\TestCase;

class NotificationTargetTest extends TestCase
{
    public function test_quote_id_from_payload_and_url(): void
    {
        $this->assertSame(42, NotificationTarget::quoteId([
            'type' => 'new_quote',
            'quote_id' => 42,
            'url' => '/client/quotes/42',
        ]));

        $this->assertSame(7, NotificationTarget::quoteId([
            'type' => 'new_quote',
            'url' => '/client/quotes/7',
        ]));

        $this->assertSame(9, NotificationTarget::quoteId([
            'url' => '/admin/quotes/9',
        ]));

        $this->assertNull(NotificationTarget::quoteId([
            'type' => 'mission_assigned',
            'url' => '/agent/missions/3',
        ]));
    }

    public function test_unavailable_message_for_quote(): void
    {
        $this->assertSame(
            'Ce devis n\'est plus disponible.',
            NotificationTarget::unavailableMessage([
                'type' => 'new_quote',
                'quote_id' => 1,
            ]),
        );
    }

    public function test_new_quote_notification_payload_uses_client_quote_url(): void
    {
        $quote = new Quote;
        $quote->forceFill([
            'id' => 42,
            'quote_number' => 'DEV-TEST',
            'service_request_id' => 7,
            'estimated_price' => 99.5,
        ]);
        $quote->syncOriginal();

        $payload = (new NewQuoteNotification($quote))->toArray(new User);

        $this->assertSame('new_quote', $payload['type']);
        $this->assertSame(42, $payload['quote_id']);
        $this->assertSame(7, $payload['service_request_id']);
        $this->assertSame('/client/quotes/42', $payload['url']);
        $this->assertContains('database', (new NewQuoteNotification($quote))->via(new User));
    }
}
