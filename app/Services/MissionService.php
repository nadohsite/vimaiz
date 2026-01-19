<?php

namespace App\Services;

use App\Models\Mission;
use App\Models\MissionPhoto;
use App\Models\Quote;
use App\Models\ServiceRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MissionService
{
    protected AgentAssignmentService $assignmentService;

    public function __construct(AgentAssignmentService $assignmentService)
    {
        $this->assignmentService = $assignmentService;
    }

    public function createMissionFromQuote(Quote $quote): Mission
    {
        $request = $quote->serviceRequest;
        $property = $request->property;
        
        $scheduledAt = \Carbon\Carbon::parse(
            $request->scheduled_date->format('Y-m-d') . ' ' . $request->scheduled_time
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

    public function markAsPaid(Mission $mission, string $paymentIntentId): Mission
    {
        $mission->update([
            'payment_status' => Mission::PAYMENT_PAID,
            'payment_intent_id' => $paymentIntentId,
            'paid_at' => now(),
        ]);
        
        $mission->serviceRequest->update([
            'status' => ServiceRequest::STATUS_PAID,
        ]);
        
        $this->assignmentService->assignAgentToMission($mission);
        
        $mission->serviceRequest->update([
            'status' => ServiceRequest::STATUS_ASSIGNED,
        ]);
        
        return $mission->fresh();
    }

    public function agentAcceptMission(Mission $mission): Mission
    {
        $mission->update([
            'status' => Mission::STATUS_AGENT_ACCEPTED,
            'agent_responded_at' => now(),
        ]);
        
        return $mission->fresh();
    }

    public function agentRefuseMission(Mission $mission, string $reason = null): Mission
    {
        $mission->update([
            'status' => Mission::STATUS_AGENT_REFUSED,
            'agent_responded_at' => now(),
            'cancellation_reason' => $reason,
        ]);
        
        if ($mission->agent && $mission->agent->agentProfile) {
            $mission->agent->agentProfile->incrementMissionsRefused();
        }
        
        $newAgent = $this->assignmentService->reassignMission($mission);
        
        if (!$newAgent) {
            // TODO: Notify admin that no agent is available
        }
        
        return $mission->fresh();
    }

    public function startMission(Mission $mission): Mission
    {
        $mission->update([
            'status' => Mission::STATUS_IN_PROGRESS,
            'started_at' => now(),
        ]);
        
        $mission->serviceRequest->update([
            'status' => ServiceRequest::STATUS_IN_PROGRESS,
        ]);
        
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
            throw new \Exception('Mission cannot be completed. Photos before and after are required.');
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
        
        // TODO: Credit agent wallet
        
        return $mission->fresh();
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
