<?php

namespace App\Filament\Resources\MissionResource\Pages;

use App\Filament\Resources\MissionResource;
use App\Models\Mission;
use App\Services\MissionService;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMission extends EditRecord
{
    protected static string $resource = MissionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }

    protected function afterSave(): void
    {
        $mission = $this->record;

        if (! $mission instanceof Mission) {
            return;
        }

        if (
            $mission->wasChanged(['internal_quality_score', 'internal_quality_notes'])
            && $mission->internal_quality_score
        ) {
            app(MissionService::class)->setQualityScore(
                $mission,
                (int) $mission->internal_quality_score,
                (string) ($mission->internal_quality_notes ?? ''),
                auth()->id()
            );
        }

        if (! $mission->wasChanged('agent_id') || ! $mission->agent_id) {
            return;
        }

        if ($mission->status !== Mission::STATUS_PENDING_AGENT) {
            return;
        }

        $agent = $mission->agent;
        if (! $agent) {
            return;
        }

        app(MissionService::class)->assignSpecificAgent($mission, $agent);
    }
}
