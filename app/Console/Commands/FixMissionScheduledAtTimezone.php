<?php

namespace App\Console\Commands;

use App\Models\Mission;
use App\Support\ScheduledTime;
use Carbon\Carbon;
use Illuminate\Console\Command;

/**
 * Read-only audit for the scheduled_at timezone fix.
 *
 * The actual data fix now runs automatically as part of the migration
 * database/migrations/2026_09_30_000001_fix_mission_scheduled_at_timezone.php
 * (it ships in the same deploy as the code fix, and Laravel guarantees it
 * runs exactly once via the migrations table — no manual step, no risk of
 * running it twice or at the wrong time).
 *
 * This command is intentionally READ-ONLY: it never writes to the
 * database. Use it before or after a deploy to see which Mission rows
 * still look mislabeled (i.e. would shift if converted to Europe/Paris),
 * as a sanity check — never to apply the fix.
 */
class FixMissionScheduledAtTimezone extends Command
{
    protected $signature = 'missions:audit-scheduled-at-timezone';

    protected $description = 'Read-only: list missions whose scheduled_at would shift under a Europe/Paris conversion (diagnostic only — the real fix is the 2026_09_30 migration)';

    public function handle(): int
    {
        $missions = Mission::query()
            ->whereNotNull('scheduled_at')
            ->orderBy('id')
            ->get(['id', 'mission_number', 'scheduled_at', 'created_at']);

        if ($missions->isEmpty()) {
            $this->info('No missions with a scheduled_at to check.');

            return Command::SUCCESS;
        }

        $rows = [];

        foreach ($missions as $mission) {
            $rawValue = $mission->getRawOriginal('scheduled_at');

            if (! $rawValue) {
                continue;
            }

            $asUtc = Carbon::parse($rawValue, 'UTC');
            $asParisReinterpreted = Carbon::parse($rawValue, ScheduledTime::TIMEZONE)->utc();

            if ($asUtc->equalTo($asParisReinterpreted)) {
                continue;
            }

            $rows[] = [
                $mission->id,
                $mission->mission_number,
                $mission->created_at?->format('Y-m-d H:i'),
                $asUtc->format('Y-m-d H:i:s').' UTC',
                $asParisReinterpreted->format('Y-m-d H:i:s').' UTC (if re-labeled as Paris)',
            ];
        }

        if (empty($rows)) {
            $this->info('All missions look consistent — nothing would shift under a Europe/Paris re-interpretation.');

            return Command::SUCCESS;
        }

        $this->warn(sprintf(
            '%d mission(s) still look mislabeled. If this is AFTER the 2026_09_30 migration ran, something is wrong — investigate before assuming this is expected.',
            count($rows)
        ));

        $this->table(
            ['Mission ID', 'Mission #', 'Created at', 'Current (stored as UTC)', 'If re-labeled as Paris'],
            $rows
        );

        return Command::SUCCESS;
    }
}
