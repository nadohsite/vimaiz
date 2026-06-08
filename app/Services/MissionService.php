<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Mission;
use App\Models\MissionInvitation;
use App\Models\MissionPhoto;
use App\Models\Quote;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Notifications\AgentAcceptedMissionNotification;
use App\Notifications\AgentAcceptedMissionAdminNotification;
use App\Notifications\AgentPayoutNotification;
use App\Notifications\AgentRefusedMissionNotification;
use App\Notifications\MissionCompletedNotification;
use App\Notifications\MissionCompletedAdminNotification;
use App\Notifications\MissionStartedNotification;
use App\Notifications\PaymentReceivedNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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
        
        // Extract time from scheduled_time (might be datetime or just time)
        $timeString = $request->scheduled_time;
        if (strpos($timeString, ' ') !== false) {
            // If it contains a space, it's likely a full datetime, extract time only
            $timeString = \Carbon\Carbon::parse($timeString)->format('H:i:s');
        }
        
        $scheduledAt = \Carbon\Carbon::parse(
            $request->scheduled_date->format('Y-m-d') . ' ' . $timeString
        );
        
        $effectivePrice = $quote->final_price ?? $quote->estimated_price;
        $commissionAmount = $quote->commission_amount ?? round($effectivePrice * ($quote->commission_rate / 100), 2);
        $agentPayout = $quote->agent_amount ?? round($effectivePrice - $commissionAmount, 2);
        
        $mission = Mission::create([
            'service_request_id' => $request->id,
            'quote_id' => $quote->id,
            'property_id' => $property->id,
            'client_id' => $request->client_id,
            'scheduled_at' => $scheduledAt,
            'duration_hours' => $request->requested_hours,
            'total_price' => $effectivePrice,
            'agent_payout' => $agentPayout,
            'platform_fee' => $commissionAmount,
            'status' => Mission::STATUS_PENDING_AGENT,
            'payment_status' => Mission::PAYMENT_PENDING,
        ]);
        
        return $mission;
    }

    /**
     * Crée une mission à partir d'un devis accepté et la marque comme payée
     * (flux client Stripe ou confirmation manuelle admin).
     */
    public function createPaidMissionFromQuote(Quote $quote, string $paymentIntentId): Mission
    {
        if ($quote->mission) {
            throw new \InvalidArgumentException('Une mission existe déjà pour ce devis.');
        }

        if (! in_array($quote->status, [Quote::STATUS_ACCEPTED, Quote::STATUS_PAID], true)) {
            throw new \InvalidArgumentException('Le devis doit être accepté par le client avant de créer une mission.');
        }

        $mission = $this->createMissionFromQuote($quote);

        return $this->markAsPaid($mission, $paymentIntentId);
    }

    public function markAsPaid(Mission $mission, string $paymentIntentId): Mission
    {
        $mission->update([
            'payment_status' => Mission::PAYMENT_PAID,
            'payment_intent_id' => $paymentIntentId,
            'paid_at' => now(),
        ]);
        
        // Update quote status to paid
        $mission->quote->update([
            'status' => 'paid',
        ]);
        
        $mission->serviceRequest->update([
            'status' => ServiceRequest::STATUS_PAID,
        ]);

        $this->assignmentService->proposeMissionToAgents($mission);

        // Create invoice for the mission
        Invoice::createFromMission($mission);

        // Notify client that payment was received
        $mission->client->notify(new PaymentReceivedNotification($mission));

        return $mission->fresh();
    }

    public function agentAcceptMission(Mission $mission, User $agent): Mission
    {
        return DB::transaction(function () use ($mission, $agent) {
            $mission = Mission::lockForUpdate()->findOrFail($mission->id);

            if ($mission->status !== Mission::STATUS_PENDING_AGENT) {
                throw new \Exception('Cette mission n\'est plus disponible.');
            }

            if ($mission->agent_id === $agent->id) {
                return $this->agentConfirmLegacyAssignment($mission, $agent);
            }

            if ($mission->agent_id !== null) {
                throw new \Exception('Cette mission a déjà été acceptée par un autre agent.');
            }

            $invitation = MissionInvitation::where('mission_id', $mission->id)
                ->where('agent_id', $agent->id)
                ->where('status', MissionInvitation::STATUS_PENDING)
                ->lockForUpdate()
                ->first();

            if (! $invitation) {
                throw new \Exception('Vous n\'avez pas d\'invitation active pour cette mission.');
            }

            $mission->update([
                'agent_id' => $agent->id,
                'status' => Mission::STATUS_AGENT_ACCEPTED,
                'agent_responded_at' => now(),
            ]);

            $invitation->update([
                'status' => MissionInvitation::STATUS_ACCEPTED,
                'responded_at' => now(),
            ]);

            MissionInvitation::where('mission_id', $mission->id)
                ->where('status', MissionInvitation::STATUS_PENDING)
                ->update([
                    'status' => MissionInvitation::STATUS_WITHDRAWN,
                    'responded_at' => now(),
                ]);

            $mission->serviceRequest->update([
                'status' => ServiceRequest::STATUS_ASSIGNED,
            ]);

            $mission->client->notify(new AgentAcceptedMissionNotification($mission));

            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new AgentAcceptedMissionAdminNotification($mission));
            }

            return $mission->fresh();
        });
    }

    public function agentRefuseMission(Mission $mission, User $agent, ?string $reason = null): Mission
    {
        if ($mission->agent_id === $agent->id
            && $mission->status === Mission::STATUS_AGENT_ACCEPTED
            && $mission->canStart()) {
            return $this->agentDeclineAcceptedMission($mission, $agent, $reason);
        }

        return $this->agentRefuseInvitation($mission, $agent, $reason);
    }

    protected function agentRefuseInvitation(Mission $mission, User $agent, ?string $reason): Mission
    {
        $invitation = MissionInvitation::where('mission_id', $mission->id)
            ->where('agent_id', $agent->id)
            ->where('status', MissionInvitation::STATUS_PENDING)
            ->first();

        if (! $invitation) {
            if ($mission->agent_id === $agent->id && $mission->status === Mission::STATUS_PENDING_AGENT) {
                return $this->agentRefuseLegacyAssignment($mission, $agent, $reason);
            }

            throw new \Exception('Invitation introuvable ou déjà traitée.');
        }

        $invitation->update([
            'status' => MissionInvitation::STATUS_REFUSED,
            'responded_at' => now(),
            'refusal_reason' => $reason,
        ]);

        if ($agent->agentProfile) {
            $agent->agentProfile->incrementMissionsRefused();
        }

        $this->assignmentService->fillPendingInvitationSlots($mission);

        return $mission->fresh();
    }

    /**
     * Missions assignées directement (admin ou ancien flux) : l'agent confirme sa prise en charge.
     */
    protected function agentConfirmLegacyAssignment(Mission $mission, User $agent): Mission
    {
        $mission->update([
            'status' => Mission::STATUS_AGENT_ACCEPTED,
            'agent_responded_at' => now(),
        ]);

        MissionInvitation::updateOrCreate(
            [
                'mission_id' => $mission->id,
                'agent_id' => $agent->id,
            ],
            [
                'status' => MissionInvitation::STATUS_ACCEPTED,
                'responded_at' => now(),
                'notified_at' => now(),
            ]
        );

        $mission->serviceRequest->update([
            'status' => ServiceRequest::STATUS_ASSIGNED,
        ]);

        $mission->client->notify(new AgentAcceptedMissionNotification($mission));

        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new AgentAcceptedMissionAdminNotification($mission));
        }

        return $mission->fresh();
    }

    /**
     * Missions assignées avant le système d'invitations (agent_id direct, sans invitation).
     */
    protected function agentRefuseLegacyAssignment(Mission $mission, User $agent, ?string $reason): Mission
    {
        MissionInvitation::updateOrCreate(
            [
                'mission_id' => $mission->id,
                'agent_id' => $agent->id,
            ],
            [
                'status' => MissionInvitation::STATUS_REFUSED,
                'responded_at' => now(),
                'refusal_reason' => $reason,
                'notified_at' => now(),
            ]
        );

        $mission->update([
            'agent_id' => null,
            'status' => Mission::STATUS_PENDING_AGENT,
            'agent_responded_at' => null,
        ]);

        if ($agent->agentProfile) {
            $agent->agentProfile->incrementMissionsRefused();
        }

        $this->assignmentService->fillPendingInvitationSlots($mission);

        return $mission->fresh();
    }

    protected function agentDeclineAcceptedMission(Mission $mission, User $agent, ?string $reason): Mission
    {
        MissionInvitation::where('mission_id', $mission->id)
            ->where('agent_id', $agent->id)
            ->where('status', MissionInvitation::STATUS_ACCEPTED)
            ->update([
                'status' => MissionInvitation::STATUS_DECLINED,
                'responded_at' => now(),
                'refusal_reason' => $reason,
            ]);

        $mission->update([
            'agent_id' => null,
            'status' => Mission::STATUS_PENDING_AGENT,
            'agent_responded_at' => null,
        ]);

        $mission->serviceRequest->update([
            'status' => ServiceRequest::STATUS_PAID,
        ]);

        if ($agent->agentProfile) {
            $agent->agentProfile->incrementMissionsRefused();
        }

        $missionForNotification = $mission->fresh(['agent']);
        $missionForNotification->setRelation('agent', $agent);

        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new AgentRefusedMissionNotification($missionForNotification, $reason));
        }

        $this->assignmentService->reactivateWithdrawnInvitations($mission);
        $this->assignmentService->fillPendingInvitationSlots($mission);

        return $mission->fresh();
    }

    public function startMission(Mission $mission, float $agentLatitude, float $agentLongitude): Mission
    {
        $property = $mission->property;

        if ($property->latitude === null || $property->longitude === null) {
            throw new \Exception('Localisation du logement indisponible. Contactez le support.');
        }

        $distance = $property->distanceToInMeters($agentLatitude, $agentLongitude);

        if ($distance > self::MAX_START_DISTANCE_METERS) {
            throw new \Exception(
                'Vous ne semblez pas encore être devant le bon logement. Assurez-vous d\'être sur place à l\'adresse : '
                . $property->full_address . '.'
            );
        }

        $mission->update([
            'status' => Mission::STATUS_IN_PROGRESS,
            'started_at' => now(),
        ]);

        $mission->serviceRequest->update([
            'status' => ServiceRequest::STATUS_IN_PROGRESS,
        ]);

        $mission->client->notify(new MissionStartedNotification($mission));

        $mission = $mission->fresh();
        $this->updateMissionPhotoStatus($mission);

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
        $path = $file->store('mission-photos/' . $mission->id, 'public');
        
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

    public function completeMission(Mission $mission): Mission
    {
        if (!$mission->canComplete()) {
            throw new \Exception('La mission ne peut pas être terminée dans son état actuel.');
        }
        
        $mission->update([
            'status' => Mission::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
        
        $mission->serviceRequest->update([
            'status' => ServiceRequest::STATUS_COMPLETED,
        ]);
        
        if ($mission->agent && $mission->agent->agentProfile) {
            $mission->agent->agentProfile->incrementMissionsCompleted();
        }
        
        // Credit agent wallet
        $this->creditAgentWallet($mission);
        
        // Notify client that mission is completed
        $mission->client->notify(new MissionCompletedNotification($mission));
        
        // Notify admins that mission is completed
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new MissionCompletedAdminNotification($mission));
        }
        
        return $mission->fresh();
    }

    protected function creditAgentWallet(Mission $mission): void
    {
        if (!$mission->agent) {
            return;
        }
        
        $wallet = $mission->agent->wallet;
        if (!$wallet) {
            $wallet = $mission->agent->wallet()->create([
                'balance' => 0,
                'pending_balance' => 0,
                'total_earned' => 0,
                'total_withdrawn' => 0,
            ]);
        }
        
        $wallet->credit(
            $mission->agent_payout,
            'Mission ' . $mission->mission_number,
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
        
        // TODO: Process refund if paid
        
        return $mission->fresh();
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
