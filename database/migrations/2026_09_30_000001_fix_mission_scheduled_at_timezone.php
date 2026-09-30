<?php

use App\Support\ScheduledTime;
use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Before this release, App\Support\ScheduledTime::combine() built
     * Mission.scheduled_at from the client's Europe/Paris wall-clock choice
     * without ever specifying a timezone. Since the app's default timezone
     * is UTC, that hour was stored as if it were already UTC — 1h (winter)
     * or 2h (summer) earlier than the real instant. The client-facing and
     * agent-facing screens masked this by never converting scheduled_at
     * through a real timezone (they read the raw digits back out), but any
     * screen that DOES convert it correctly — the Filament admin edit
     * form, for instance — showed the shifted hour. That's the "10h shown
     * as 12h after approval" symptom this release fixes.
     *
     * This release also switches the client/agent Mission screens to a
     * real, correct timezone conversion (see resources/js/lib/datetime.ts,
     * formatInstantDate/Time/DateTime). That means every EXISTING mission
     * row — still holding the old, mislabeled value — must be corrected in
     * this exact same deploy, or those screens would start showing the
     * wrong hour for old missions instead of accidentally-right one.
     *
     * Every Mission row that exists at the moment this migration runs was
     * necessarily created by the old, unfixed combine() (the corrected
     * combine() and this correction ship in the same release), so there is
     * no cutoff to reason about: it is safe to process every row exactly
     * once. Being a migration (not a manually-run command), Laravel's
     * migrations table guarantees it runs exactly once, at the moment the
     * rest of this release is deployed — never earlier, never twice.
     */
    public function up(): void
    {
        DB::table('missions')
            ->whereNotNull('scheduled_at')
            ->chunkById(500, function ($missions) {
                foreach ($missions as $mission) {
                    // The raw stored digits ARE the client's real
                    // Europe/Paris wall-clock hour (that part was never
                    // wrong) — re-parse them explicitly in that timezone,
                    // then convert to the true UTC instant for storage.
                    $corrected = Carbon::parse($mission->scheduled_at, ScheduledTime::TIMEZONE)->utc();

                    DB::table('missions')
                        ->where('id', $mission->id)
                        ->update(['scheduled_at' => $corrected]);
                }
            });
    }

    /**
     * Reverse the migrations: restore the original (mislabeled) value —
     * i.e. re-express the true UTC instant as the same literal digits the
     * old, buggy code would have stored.
     */
    public function down(): void
    {
        DB::table('missions')
            ->whereNotNull('scheduled_at')
            ->chunkById(500, function ($missions) {
                foreach ($missions as $mission) {
                    $reverted = Carbon::parse($mission->scheduled_at, 'UTC')
                        ->setTimezone(ScheduledTime::TIMEZONE)
                        ->format('Y-m-d H:i:s');

                    DB::table('missions')
                        ->where('id', $mission->id)
                        ->update(['scheduled_at' => $reverted]);
                }
            });
    }
};
