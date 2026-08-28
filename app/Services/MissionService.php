<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Mission;
use App\Models\MissionAnomaly;
use App\Models\MissionPhoto;
use App\Models\Quote;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Notifications\AgentAcceptedMissionAdminNotification;
use App\Notifications\AgentAcceptedMissionNotification;
use App\Notifications\AgentInterventionCompletedNotification;
use App\Notifications\AgentInterventionConfirmedNotification;
use App\Notifications\AgentPayoutNotification;
use App\Notifications\AgentRefusedMissionClientNotification;
use App\Notifications\AgentRefusedMissionNotification;
use App\Notifications\MissionAssignedNotification;
use App\Notifications\MissionCompletedAdminNotification;
use App\Notifications\MissionCompletedNotification;
use App\Notifications\MissionNeedsAgentNotification;
use App\Notifications\MissionStartedNotification;
use App\Notifications\PaymentReceivedNotification;
use App\Support\DefaultPropertyChecklist;
use App\Support\InterventionReportCatalog;
use App\Support\ScheduledTime;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\Refund;
use Stripe\Stripe;
use Throwable;

class MissionService
{
    public const MAX_START_DISTANCE_METERS = 25;

    protected AgentAssignmentService $assignmentService;

    public function __construct(AgentAssignmentService $assignmentService)
    {
        $this->assignmentService = $assignmentService;
    }

    public function createMissionFromQuote(Quote $quote): Mission
    {
        $request = $quote->serviceRequest;
        $property = $request->property;

        $scheduledAt = ScheduledTime::combine(
            $request->scheduled_date,
            $request->scheduled_time
        );

        $effectivePrice = $quote->final_price ?? $quote->estimated_price;
        $commissionAmount = $quote->commission_amount ?? round($effectivePrice * ($quote->commission_rate / 100), 2);
        $agentPayout = $quote->agent_amount ?? round($effectivePrice - $commissionAmount, 2);
        $durationHours = (int) max(1, round((float) ($request->requested_hours ?: $quote->estimated_hours ?: 1)));

        $mission = Mission::create([
            'service_request_id' => $request->id,
            'quote_id' => $quote->id,
            'property_id' => $property->id,
            'client_id' => $request->client_id,
            'scheduled_at' => $scheduledAt,
            'duration_hours' => $durationHours,
            'checklist' => DefaultPropertyChecklist::snapshotForMission(
                $request->checklist ?: $property->checklist
            ),
            'total_price' => $effectivePrice,
            'agent_payout' => $agentPayout,
            'platform_fee' => $commissionAmount,
            'status' => Mission::STATUS_PENDING_AGENT,
            'payment_status' => Mission::PAYMENT_PENDING,
        ]);

        return $mission;
    }

    public function fulfillPaidQuote(Quote $quote, string $paymentIntentId): Mission
    {
        [$mission, $notifiedAgents] = DB::transaction(function () use ($quote, $paymentIntentId) {
            $quote = Quote::query()->whereKey($quote->id)->lockForUpdate()->firstOrFail();

            $mission = Mission::query()
                ->where('quote_id', $quote->id)
                ->lockForUpdate()
                ->first();

            if (! $mission) {
                try {
                    $mission = $this->createMissionFromQuote($quote);
                } catch (UniqueConstraintViolationException) {
                    $mission = Mission::query()
                        ->where('quote_id', $quote->id)
                        ->lockForUpdate()
                        ->firstOrFail();
                }
            }

            return $this->markAsPaid($mission, $paymentIntentId);
        });

        $this->notifyAfterPayment($mission, $notifiedAgents);

        return $mission;
    }

    /**
     * @return array{0: Mission, 1: Collection<int, User>}
     */
    public function markAsPaid(Mission $mission, string $paymentIntentId): array
    {
        if ($mission->isPaid()) {
            return [$mission->fresh(), collect()];
        }

        $hadAgent = (bool) $mission->agent_id;
        $hadInvoice = Invoice::query()->where('mission_id', $mission->id)->exists();

        $mission->update([
            'payment_status' => Mission::PAYMENT_PAID,
            'payment_intent_id' => $paymentIntentId,
            'paid_at' => now(),
        ]);

        $mission->quote->update([
            'status' => Quote::STATUS_PAID,
            'payment_intent_id' => $paymentIntentId,
        ]);

        $mission->serviceRequest->update([
            'status' => ServiceRequest::STATUS_PAID,
        ]);

        if ($hadAgent && $mission->agent) {
            $notifiedAgents = collect([$mission->agent]);
        } else {
            $notifiedAgents = $this->assignmentService->proposeToAvailableAgents($mission);
        }

        $mission->refresh();

        $mission->serviceRequest->update([
            'status' => $mission->agent_id
                ? ServiceRequest::STATUS_ASSIGNED
                : ServiceRequest::STATUS_PAID,
        ]);

        if (! $hadInvoice) {
            Invoice::createFromMission($mission->fresh());
        }

        return [$mission->fresh(), $notifiedAgents];
    }

    public function assignSpecificAgent(Mission $mission, User $agent): Mission
    {
        $mission->update([
            'agent_id' => $agent->id,
            'status' => Mission::STATUS_PENDING_AGENT,
            'agent_notified_at' => now(),
            'assignment_attempts' => $mission->assignment_attempts + 1,
        ]);

        $mission->serviceRequest->update([
            'status' => ServiceRequest::STATUS_ASSIGNED,
        ]);

        $this->notifyAgentsOfProposal(collect([$agent]), $mission->fresh(['property']));

        return $mission->fresh();
    }

    /**
     * @param  Collection<int, User>  $notifiedAgents
     */
    protected function notifyAfterPayment(Mission $mission, Collection $notifiedAgents): void
    {
        $freshMission = $mission->fresh(['property', 'client']);

        if ($freshMission->client) {
            $this->safeNotify(
                fn () => $freshMission->client->notify(new PaymentReceivedNotification($freshMission)),
                'payment_received',
                $freshMission,
            );
        }

        $this->notifyAgentsOfProposal($notifiedAgents, $freshMission);

        if ($notifiedAgents->isEmpty() && ! $freshMission->agent_id) {
            $this->safeNotify(
                fn () => User::notifyAdmins(new MissionNeedsAgentNotification($freshMission)),
                'mission_needs_agent',
                $freshMission,
            );
        }
    }

    /**
     * @param  Collection<int, User>  $agents
     */
    protected function notifyAgentsOfProposal(Collection $agents, Mission $mission): void
    {
        $freshMission = $mission->relationLoaded('property')
            ? $mission
            : $mission->fresh(['property']);

        foreach ($agents as $agent) {
            $this->safeNotify(
                fn () => $agent->notify(new MissionAssignedNotification($freshMission)),
                'mission_assigned',
                $freshMission,
                $agent,
            );
        }
    }

    protected function safeNotify(callable $callback, string $type, Mission $mission, ?User $agent = null): void
    {
        try {
            $callback();
        } catch (Throwable $e) {
            Log::error('Failed to emit notification', [
                'type' => $type,
                'mission_id' => $mission->id,
                'agent_id' => $agent?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function agentAcceptMission(Mission $mission, User $agent): Mission
    {
        return DB::transaction(function () use ($mission, $agent) {
            $mission = Mission::query()->whereKey($mission->id)->lockForUpdate()->firstOrFail();

            if ($mission->status !== Mission::STATUS_PENDING_AGENT) {
                throw new \Exception('Cette intervention n\'est plus disponible.');
            }

            if ($mission->agent_id && $mission->agent_id !== $agent->id) {
                throw new \Exception('Cette intervention a déjà été prise par un autre intervenant.');
            }

            $alreadyPending = Mission::query()
                ->where('agent_id', $agent->id)
                ->where('status', Mission::STATUS_PENDING_AGENT)
                ->whereKeyNot($mission->id)
                ->exists();

            if ($alreadyPending) {
                throw new \Exception('Vous avez déjà une intervention en attente de réponse.');
            }

            $mission->update([
                'agent_id' => $agent->id,
                'status' => Mission::STATUS_AGENT_ACCEPTED,
                'agent_responded_at' => now(),
            ]);

            $mission->serviceRequest->update([
                'status' => ServiceRequest::STATUS_ASSIGNED,
            ]);

            $mission = $mission->fresh(['client', 'agent', 'property']);

            $mission->client->notify(new AgentAcceptedMissionNotification($mission));

            if ($mission->agent) {
                $mission->agent->notify(new AgentInterventionConfirmedNotification($mission));
            }

            User::notifyAdmins(new AgentAcceptedMissionAdminNotification($mission));

            return $mission;
        });
    }

    public function agentRefuseMission(Mission $mission, User $agent, ?string $reason = null): Mission
    {
        $mission->declinedAgents()->syncWithoutDetaching([
            $agent->id => ['reason' => $reason],
        ]);

        $wasAssignedToAgent = $mission->agent_id === $agent->id;

        if (! $wasAssignedToAgent) {
            $remaining = $this->assignmentService->findEligibleAgents($mission);

            if ($remaining->isEmpty()) {
                $this->safeNotify(
                    fn () => User::notifyAdmins(new MissionNeedsAgentNotification($mission->fresh(['property']))),
                    'mission_needs_agent',
                    $mission,
                );
            }

            return $mission->fresh();
        }

        $client = $mission->client;

        $mission->update([
            'status' => Mission::STATUS_AGENT_REFUSED,
            'agent_responded_at' => now(),
            'cancellation_reason' => $reason,
        ]);

        if ($mission->agent && $mission->agent->agentProfile) {
            $mission->agent->agentProfile->incrementMissionsRefused();
        }

        User::notifyAdmins(new AgentRefusedMissionNotification($mission, $reason));

        if ($client) {
            $client->notify(new AgentRefusedMissionClientNotification($mission));
        }

        $newAgents = $this->assignmentService->reassignMission($mission);

        $freshMission = $mission->fresh(['property']);

        if ($newAgents->isNotEmpty()) {
            $this->notifyAgentsOfProposal($newAgents, $freshMission);
        } else {
            $mission->serviceRequest->update([
                'status' => ServiceRequest::STATUS_PAID,
            ]);
            $this->safeNotify(
                fn () => User::notifyAdmins(new MissionNeedsAgentNotification($freshMission)),
                'mission_needs_agent',
                $freshMission,
            );
        }

        return $mission->fresh();
    }

    public function startMission(Mission $mission, float $agentLatitude, float $agentLongitude): Mission
    {
        $property = $mission->property;

        if (! $property || ! $property->latitude || ! $property->longitude) {
            throw new \Exception(
                'Nous ne pouvons pas vérifier l\'emplacement de ce logement pour le moment. '
                .'Vérifiez l\'adresse affichée sur la fiche mission, puis contactez le support si besoin.'
            );
        }

        $distanceMeters = $property->distanceToInMeters($agentLatitude, $agentLongitude);

        if ($distanceMeters === null || $distanceMeters > self::MAX_START_DISTANCE_METERS) {
            $address = $property->full_address;

            throw new \Exception(
                'Vous ne semblez pas encore être devant le bon logement. '
                ."Avant de démarrer, assurez-vous d'être sur place à l'adresse suivante : {$address}."
            );
        }

        $mission->update([
            'status' => Mission::STATUS_IN_PROGRESS,
            'started_at' => now(),
        ]);

        $mission->serviceRequest->update([
            'status' => ServiceRequest::STATUS_IN_PROGRESS,
        ]);

        // Notify client that mission started
        $mission->client->notify(new MissionStartedNotification($mission));

        return $mission->fresh();
    }

    public function uploadPhoto(
        Mission $mission,
        UploadedFile $file,
        string $type,
        int $uploadedBy,
        ?string $description = null,
        ?float $latitude = null,
        ?float $longitude = null
    ): MissionPhoto {
        $path = $file->store('mission-photos/'.$mission->id, 'public');

        $photo = MissionPhoto::create([
            'mission_id' => $mission->id,
            'uploaded_by' => $uploadedBy,
            'type' => $type,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'description' => $description,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'taken_at' => now(),
        ]);

        $this->updateMissionPhotoStatus($mission);

        return $photo;
    }

    protected function updateMissionPhotoStatus(Mission $mission): void
    {
        $beforeCount = $mission->beforePhotos()->count();
        $afterCount = $mission->afterPhotos()->count();

        if ($beforeCount >= 3 && $mission->status === Mission::STATUS_IN_PROGRESS) {
            $mission->update(['status' => Mission::STATUS_PHOTOS_BEFORE]);
        }

        if ($afterCount >= 3 && $mission->status === Mission::STATUS_PHOTOS_BEFORE) {
            $mission->update(['status' => Mission::STATUS_PHOTOS_AFTER]);
        }
    }

    public function completeMission(Mission $mission, array $report = []): Mission
    {
        $nothingToReport = (bool) ($report['nothing_to_report'] ?? false);
        $rawAnomalies = $report['anomalies'] ?? [];

        if (! $nothingToReport && empty($rawAnomalies)) {
            throw new \Exception('Indiquez si tout est conforme, ou signalez au moins un élément.');
        }

        $resolvedAnomalies = [];
        if (! $nothingToReport) {
            foreach ($rawAnomalies as $raw) {
                $resolvedAnomalies[] = InterventionReportCatalog::resolveAnomaly(
                    (string) ($raw['category'] ?? ''),
                    (string) ($raw['type'] ?? ''),
                    isset($raw['notes']) ? (string) $raw['notes'] : null
                );
            }
        }

        $completedAt = now();

        $mission = DB::transaction(function () use ($mission, $nothingToReport, $resolvedAnomalies, $completedAt) {
            $mission = Mission::query()->whereKey($mission->id)->lockForUpdate()->firstOrFail();

            if (! $mission->canComplete()) {
                throw new \Exception('L\'intervention ne peut pas être terminée dans son état actuel.');
            }

            $actualMinutes = $mission->started_at
                ? max(1, (int) $mission->started_at->diffInMinutes($completedAt))
                : null;

            $mission->update([
                'status' => Mission::STATUS_COMPLETED,
                'completed_at' => $completedAt,
                'actual_duration_minutes' => $actualMinutes,
                'report_nothing_to_report' => $nothingToReport,
                'report_submitted_at' => $completedAt,
            ]);

            $mission->anomalies()->delete();

            foreach ($resolvedAnomalies as $anomaly) {
                MissionAnomaly::create([
                    'mission_id' => $mission->id,
                    'property_id' => $mission->property_id,
                    'agent_id' => $mission->agent_id,
                    'category' => $anomaly['category'],
                    'category_label' => $anomaly['category_label'],
                    'type' => $anomaly['type'],
                    'label' => $anomaly['label'],
                    'notes' => $anomaly['notes'],
                    'suggests_follow_up' => $anomaly['suggests_follow_up'],
                ]);
            }

            $mission->serviceRequest->update([
                'status' => ServiceRequest::STATUS_COMPLETED,
            ]);

            if ($mission->agent && $mission->agent->agentProfile) {
                $mission->agent->agentProfile->incrementMissionsCompleted();
            }

            $this->creditAgentWallet($mission);

            return $mission->fresh(['property', 'anomalies', 'agent', 'client']);
        });

        // Notify client that intervention is completed
        $mission->client->notify(new MissionCompletedNotification($mission));

        // Notify intervenant awaiting client confirmation
        if ($mission->agent) {
            $mission->agent->notify(new AgentInterventionCompletedNotification($mission));
        }

        User::notifyAdmins(new MissionCompletedAdminNotification($mission));

        return $mission;
    }

    public function updateChecklistItem(Mission $mission, string $sectionId, string $itemId, bool $checked): Mission
    {
        if (! $mission->canComplete()) {
            throw new \Exception('La checklist ne peut être cochée qu\'une fois la mission démarrée.');
        }

        $checklist = $mission->checklist ?? [];
        $found = false;

        foreach ($checklist as &$section) {
            if (($section['id'] ?? null) !== $sectionId) {
                continue;
            }

            foreach ($section['items'] as &$item) {
                if (($item['id'] ?? null) !== $itemId) {
                    continue;
                }

                $item['checked'] = $checked;
                $item['checked_at'] = $checked ? now()->toIso8601String() : null;
                $found = true;
                break 2;
            }
        }
        unset($section, $item);

        if (! $found) {
            throw new \Exception('Tâche introuvable dans la checklist.');
        }

        $mission->update(['checklist' => $checklist]);

        return $mission->fresh();
    }

    protected function creditAgentWallet(Mission $mission): void
    {
        if (! $mission->agent) {
            return;
        }

        $wallet = $mission->agent->wallet;
        if (! $wallet) {
            $wallet = $mission->agent->wallet()->create([
                'balance' => 0,
                'pending_balance' => 0,
                'total_earned' => 0,
                'total_withdrawn' => 0,
            ]);
        }

        $alreadyCredited = $wallet->transactions()
            ->where('mission_id', $mission->id)
            ->where('type', 'credit')
            ->exists();

        if ($alreadyCredited) {
            return;
        }

        $wallet->credit(
            $mission->agent_payout,
            'Mission '.$mission->mission_number,
            $mission
        );

        // Notify agent of payout
        $mission->agent->notify(new AgentPayoutNotification($mission, $mission->agent_payout));
    }

    public function cancelMission(Mission $mission, string $reason): Mission
    {
        $mission->update([
            'status' => Mission::STATUS_CANCELLED,
            'cancellation_reason' => $reason,
            'cancelled_at' => now(),
        ]);

        $mission->serviceRequest->update([
            'status' => ServiceRequest::STATUS_CANCELLED,
            'cancellation_reason' => $reason,
            'cancelled_at' => now(),
        ]);

        if ($mission->agent && $mission->agent->agentProfile) {
            $mission->agent->agentProfile->incrementMissionsCancelled();
        }

        if ($mission->isPaid() && $mission->payment_intent_id) {
            $this->refundStripePayment($mission);
        }

        return $mission->fresh();
    }

    protected function refundStripePayment(Mission $mission): void
    {
        Stripe::setApiKey(config('services.stripe.secret') ?: config('cashier.secret'));

        try {
            Refund::create([
                'payment_intent' => $mission->payment_intent_id,
            ]);
        } catch (ApiErrorException $e) {
            if (! str_contains(strtolower($e->getMessage()), 'already been refunded')) {
                throw $e;
            }
        }

        $mission->update([
            'payment_status' => Mission::PAYMENT_REFUNDED,
        ]);

        if ($mission->invoice) {
            $mission->invoice->update([
                'status' => Invoice::STATUS_REFUNDED,
            ]);
        }

        Log::info('Stripe refund processed for mission '.$mission->mission_number);
    }

    public function setQualityScore(
        Mission $mission,
        int $score,
        string $notes,
        int $reviewedBy
    ): Mission {
        $mission->update([
            'internal_quality_score' => $score,
            'internal_quality_notes' => $notes,
            'quality_reviewed_by' => $reviewedBy,
            'quality_reviewed_at' => now(),
        ]);

        if ($mission->agent && $mission->agent->agentProfile) {
            $this->updateAgentInternalRating($mission->agent->agentProfile);
        }

        return $mission->fresh();
    }

    protected function updateAgentInternalRating($agentProfile): void
    {
        $avgScore = Mission::where('agent_id', $agentProfile->user_id)
            ->whereNotNull('internal_quality_score')
            ->avg('internal_quality_score');

        if ($avgScore) {
            $agentProfile->update(['internal_rating' => round($avgScore, 2)]);
        }
    }
}
