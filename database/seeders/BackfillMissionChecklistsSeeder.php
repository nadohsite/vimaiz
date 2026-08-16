<?php

namespace Database\Seeders;

use App\Models\Mission;
use App\Models\Property;
use App\Models\ServiceRequest;
use App\Support\DefaultPropertyChecklist;
use Illuminate\Database\Seeder;

/**
 * Rattrapage pour les missions / demandes / biens créés avant les checklists.
 *
 * Usage :
 *   php artisan db:seed --class=BackfillMissionChecklistsSeeder
 */
class BackfillMissionChecklistsSeeder extends Seeder
{
    public function run(): void
    {
        $defaultSections = DefaultPropertyChecklist::sections();

        $propertiesUpdated = 0;
        Property::query()->orderBy('id')->chunkById(100, function ($properties) use ($defaultSections, &$propertiesUpdated) {
            foreach ($properties as $property) {
                if (! $this->isEmptyChecklist($property->checklist)) {
                    continue;
                }

                $property->update(['checklist' => $defaultSections]);
                $propertiesUpdated++;
            }
        });

        $requestsUpdated = 0;
        ServiceRequest::query()->with('property')->orderBy('id')->chunkById(100, function ($requests) use ($defaultSections, &$requestsUpdated) {
            foreach ($requests as $request) {
                if (! $this->isEmptyChecklist($request->checklist)) {
                    continue;
                }

                $source = ! $this->isEmptyChecklist($request->property?->checklist)
                    ? $request->property->checklist
                    : $defaultSections;

                $request->update(['checklist' => $source]);
                $requestsUpdated++;
            }
        });

        $missionsUpdated = 0;
        Mission::query()
            ->with(['serviceRequest', 'property'])
            ->orderBy('id')
            ->chunkById(100, function ($missions) use ($defaultSections, &$missionsUpdated) {
                foreach ($missions as $mission) {
                    if (! $this->isEmptyChecklist($mission->checklist)) {
                        continue;
                    }

                    $source = ! $this->isEmptyChecklist($mission->serviceRequest?->checklist)
                        ? $mission->serviceRequest->checklist
                        : (! $this->isEmptyChecklist($mission->property?->checklist)
                            ? $mission->property->checklist
                            : $defaultSections);

                    $snapshot = DefaultPropertyChecklist::snapshotForMission($source);

                    // Missions déjà terminées : cocher tout pour rester cohérent avec le statut.
                    if ($mission->status === Mission::STATUS_COMPLETED) {
                        $snapshot = $this->markAllChecked($snapshot);
                    }

                    $mission->update(['checklist' => $snapshot]);
                    $missionsUpdated++;
                }
            });

        $this->command?->info("Biens mis à jour : {$propertiesUpdated}");
        $this->command?->info("Demandes mises à jour : {$requestsUpdated}");
        $this->command?->info("Missions mises à jour : {$missionsUpdated}");
    }

    private function isEmptyChecklist(mixed $checklist): bool
    {
        return empty($checklist) || ! is_array($checklist);
    }

    /**
     * @param  list<array<string, mixed>>  $snapshot
     * @return list<array<string, mixed>>
     */
    private function markAllChecked(array $snapshot): array
    {
        $checkedAt = now()->toIso8601String();

        foreach ($snapshot as &$section) {
            foreach ($section['items'] as &$item) {
                $item['checked'] = true;
                $item['checked_at'] = $checkedAt;
            }
            unset($item);
        }
        unset($section);

        return $snapshot;
    }
}
