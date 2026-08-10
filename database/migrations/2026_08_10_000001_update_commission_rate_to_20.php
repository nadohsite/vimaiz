<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Update commission rate back to 20% for pricing rules and existing quotes.
     */
    public function up(): void
    {
        DB::table('pricing_rules')->update([
            'platform_commission_rate' => 20.00,
        ]);

        $quotes = DB::table('quotes')
            ->where('commission_rate', 25)
            ->get();

        foreach ($quotes as $quote) {
            $price = (float) ($quote->final_price ?? $quote->estimated_price ?? 0);
            $commissionAmount = $price > 0 ? round($price * 0.20, 2) : null;
            $agentAmount = $price > 0 ? round($price - $commissionAmount, 2) : null;

            DB::table('quotes')
                ->where('id', $quote->id)
                ->update(array_filter([
                    'commission_rate' => 20,
                    'commission_amount' => $commissionAmount,
                    'agent_amount' => $agentAmount,
                ], fn ($value) => $value !== null));
        }
    }

    public function down(): void
    {
        DB::table('pricing_rules')->update([
            'platform_commission_rate' => 25.00,
        ]);

        $quotes = DB::table('quotes')
            ->where('commission_rate', 20)
            ->get();

        foreach ($quotes as $quote) {
            $price = (float) ($quote->final_price ?? $quote->estimated_price ?? 0);
            $commissionAmount = $price > 0 ? round($price * 0.25, 2) : null;
            $agentAmount = $price > 0 ? round($price - $commissionAmount, 2) : null;

            DB::table('quotes')
                ->where('id', $quote->id)
                ->update(array_filter([
                    'commission_rate' => 25,
                    'commission_amount' => $commissionAmount,
                    'agent_amount' => $agentAmount,
                ], fn ($value) => $value !== null));
        }
    }
};
