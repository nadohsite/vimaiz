<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicateQuoteIds = DB::table('missions')
            ->select('quote_id')
            ->groupBy('quote_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('quote_id');

        foreach ($duplicateQuoteIds as $quoteId) {
            $keepId = DB::table('missions')
                ->where('quote_id', $quoteId)
                ->where('payment_status', 'paid')
                ->orderBy('id')
                ->value('id')
                ?? DB::table('missions')
                    ->where('quote_id', $quoteId)
                    ->orderBy('id')
                    ->value('id');

            if ($keepId) {
                DB::table('missions')
                    ->where('quote_id', $quoteId)
                    ->where('id', '!=', $keepId)
                    ->delete();
            }
        }

        Schema::table('missions', function (Blueprint $table) {
            $table->unique('quote_id');
        });

        Schema::table('quotes', function (Blueprint $table) {
            $table->string('payment_intent_id')->nullable()->after('expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('missions', function (Blueprint $table) {
            $table->dropUnique(['quote_id']);
        });

        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn('payment_intent_id');
        });
    }
};
