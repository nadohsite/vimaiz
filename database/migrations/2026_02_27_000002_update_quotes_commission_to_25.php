<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Update all existing quotes with 20% commission to 25%
     */
    public function up(): void
    {
        // Update commission rate from 20% to 25% for all existing quotes
        DB::table('quotes')
            ->where('commission_rate', 20)
            ->update([
                'commission_rate' => 25,
                'updated_at' => now(),
            ]);

        // Recalculate commission_amount and agent_amount for affected quotes
        $quotes = DB::table('quotes')->get();
        foreach ($quotes as $quote) {
            $price = $quote->final_price ?? $quote->estimated_price;
            $commissionAmount = round($price * ($quote->commission_rate / 100), 2);
            $agentAmount = round($price - $commissionAmount, 2);

            DB::table('quotes')
                ->where('id', $quote->id)
                ->update([
                    'commission_amount' => $commissionAmount,
                    'agent_amount' => $agentAmount,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert commission rate from 25% back to 20%
        DB::table('quotes')
            ->where('commission_rate', 25)
            ->update([
                'commission_rate' => 20,
                'updated_at' => now(),
            ]);
    }
};
