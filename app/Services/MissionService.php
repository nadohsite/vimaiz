<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Mission;
use App\Models\MissionAgent;
use App\Models\MissionAnomaly;
use App\Models\MissionPhoto;
use App\Models\Property;
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
            'required_agents' => $this->requiredAgentsForProperty($property),
        ]);

        return $mission;
    }

    /**
     * Volet 6 du cahier des charges "grands espaces" (décision du
     * 14/10/2026) : 125 m² maximum par intervenant, calculé dynamiquement,
     * sans exception. Les biens sous 200 m² (parc existant conservé,
     * décision du 14/10/2026) restent en mono-agent.
     */
    protected function requiredAgentsForProperty(Property $property): int
    {
        if ((float) $property->surface_area < 200) {
            return 1;
        }

        return max(2, (int) ceil((float) $property->surface_area / 125));
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

    /**
     * Attribution manuelle (admin) d'un intervenant à un créneau de la
     * mission. Sur une brigade, ceci pourvoit UN créneau ouvert — pas
     * forcément tous — l'admin peut l'utiliser plusieurs fois pour compléter
     * une brigade restée incomplète.
     */
    public function assignSpecificAgent(Mission $mission, User $agent): Mission
    {
        MissionAgent::updateOrCreate(
            ['mission_id' => $mission->id, 'agent_id' => $agent->id],
            [
                'status' => MissionAgent::STATUS_PENDING_AGENT,
                'notified_at' => now(),
                'refusal_reason' => null,
            ]
        );

        $mission->update([
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

    /**
     * Acceptation par agent, créneau par créneau (brigades). Sur une
     * mission mono-agent (required_agents = 1), le premier (et seul)
     * créneau accepté complète immédiatement la brigade : le comportement
     * observable reste identique à avant cette évolution.
     */
    public function agentAcceptMission(Mission $mission, User $agent): Mission
    {
        return DB::transaction(function () use ($mission, $agent) {
            $mission = Mission::query()->whereKey($mission->id)->lockForUpdate()->firstOrFail();

            if ($mission->status !== Mission::STATUS_PENDING_AGENT) {
                throw new \Exception('Cette intervention n\'est plus disponible.');
            }

            if ($mission->isFullyStaffed()) {
                throw new \Exception('Cette intervention a déjà sa brigade complète.');
            }

            $missionAgent = MissionAgent::where('mission_id', $mission->id)
                ->where('agent_id', $agent->id)
                ->first();

            if (! $missionAgent || $missionAgent->status !== MissionAgent::STATUS_PENDING_AGENT) {
                throw new \Exception('Cette intervention ne vous a pas été proposée ou n\'est plus disponible.');
            }

            $alreadyPending = Mission::query()
                ->where('agent_id', $agent->id)
                ->where('status', Mission::STATUS_PENDING_AGENT)
                ->whereKeyNot($mission->id)
                ->exists();

            if (! $alreadyPending) {
                // Brigades : l'agent peut avoir une proposition en attente
                // sur une autre mission sans en être (encore) le référent
                // (même logique que GeographicMatchingService::hasPendingMission()
                // / AgentAssignmentService::hasPendingMission()).
                $alreadyPending = MissionAgent::query()
                    ->where('agent_id', $agent->id)
                    ->where('status', MissionAgent::STATUS_PENDING_AGENT)
                    ->where('mission_id', '!=', $mission->id)
                    ->exists();
            }

            if ($alreadyPending) {
                throw new \Exception('Vous avez déjà une intervention en attente de réponse.');
            }

            $isFirstAcceptance = $mission->accepted_agents_count === 0;

            $missionAgent->update([
                'status' => MissionAgent::STATUS_ACCEPTED,
                'responded_at' => now(),
                'is_lead' => $isFirstAcceptance,
            ]);

            $newAcceptedCount = $mission->accepted_agents_count + 1;
            $isFullyStaffed = $newAcceptedCount >= $mission->required_agents;

            $mission->update([
                // Le premier agent à accepter devient le référent (compat
                // avec tout le code qui ne connaît que missions.agent_id).
                'agent_id' => $isFirstAcceptance ? $agent->id : $mission->agent_id,
                'accepted_agents_count' => $newAcceptedCount,
                'status' => $isFullyStaffed ? Mission::STATUS_AGENT_ACCEPTED : Mission::STATUS_PENDING_AGENT,
                'agent_responded_at' => now(),
            ]);

            if ($isFullyStaffed) {
                $mission->serviceRequest->update([
                    'status' => ServiceRequest::STATUS_ASSIGNED,
                ]);
            }

            $mission = $mission->fresh(['client', 'agent', 'property']);

            // Le client et l'admin ne sont notifiés "intervention confirmée"
            // qu'une fois la brigade complète, pour ne pas envoyer N
            // notifications identiques sur une mission à plusieurs agents.
            if ($isFullyStaffed) {
                $this->safeNotify(
                    fn () => $mission->client->notify(new AgentAcceptedMissionNotification($mission)),
                    'agent_accepted_mission',
                    $mission,
                );
                $this->safeNotify(
                    fn () => User::notifyAdmins(new AgentAcceptedMissionAdminNotification($mission)),
                    'agent_accepted_mission_admin',
                    $mission,
                );
            }

            $this->safeNotify(
                fn () => $agent->notify(new AgentInterventionConfirmedNotification($mission)),
                'agent_intervention_confirmed',
                $mission,
                $agent,
            );

            return $mission;
        });
    }

    /**
     * Refus par agent, créneau par créneau (brigades). Un désistement après
     * acceptation ne libère QUE le créneau de cet agent — pas toute la
     * mission — et, puisque la répartition du paiement n'est calculée qu'à
     * la clôture (cf. holdBrigadePayouts()), le pool se redivise
     * automatiquement sur les agents réellement restants (décision
     * utilisateur du 15/10/2026), sans recalcul explicite ici.
     */
    public function agentRefuseMission(Mission $mission, User $agent, ?string $reason = null): Mission
    {
        // Verrouillage pessimiste comme agentAcceptMission() : un refus et
        // une acceptation concurrents sur la même brigade (ou deux refus
        // concurrents) ne doivent pas lire/écrire accepted_agents_count ou
        // le référent (agent_id) sur la base d'un état déjà périmé.
        [$hadAcceptedSlot, $result] = DB::transaction(function () use ($mission, $agent, $reason) {
            $mission = Mission::query()->whereKey($mission->id)->lockForUpdate()->firstOrFail();

            $mission->declinedAgents()->syncWithoutDetaching([
                $agent->id => ['reason' => $reason],
            ]);

            $missionAgent = MissionAgent::where('mission_id', $mission->id)
                ->where('agent_id', $agent->id)
                ->first();

            $hadAcceptedSlot = $missionAgent && $missionAgent->status === MissionAgent::STATUS_ACCEPTED;

            if ($missionAgent) {
                $missionAgent->update([
                    'status' => MissionAgent::STATUS_REFUSED,
                    'responded_at' => now(),
                    'refusal_reason' => $reason,
                ]);
            }

            if (! $hadAcceptedSlot) {
                // L'agent déclinait une simple proposition, sans avoir
                // encore accepté de créneau : rien à réorganiser côté
                // brigade déjà constituée.
                return [false, $mission->fresh()];
            }

            // L'agent avait accepté puis se désiste : on libère son créneau.
            $newAcceptedCount = max(0, $mission->accepted_agents_count - 1);
            $wasLead = $mission->agent_id === $agent->id;

            $mission->update([
                'accepted_agents_count' => $newAcceptedCount,
                'status' => Mission::STATUS_AGENT_REFUSED,
                'agent_responded_at' => now(),
                'cancellation_reason' => $reason,
            ]);

            if ($wasLead) {
                // Le prochain agent déjà accepté (le plus ancien) devient le
                // nouveau référent, pour que missions.agent_id reste cohérent
                // avec le reste du code (photos, notes internes, policies,
                // Filament) qui ne connaît qu'un seul "agent_id" par mission.
                $newLead = $mission->missionAgents()
                    ->where('status', MissionAgent::STATUS_ACCEPTED)
                    ->oldest('responded_at')
                    ->first();

                $mission->update(['agent_id' => $newLead?->agent_id]);

                if ($newLead) {
                    $newLead->update(['is_lead' => true]);
                }
            }

            return [true, ['newAcceptedCount' => $newAcceptedCount, 'mission' => $mission]];
        });

        if (! $hadAcceptedSlot) {
            // Hors transaction : vérifier qu'il reste des candidats ne fait
            // que lire et notifier, pas besoin du verrou.
            $remaining = $this->assignmentService->findEligibleAgents($mission);

            if ($remaining->isEmpty() && $mission->accepted_agents_count === 0) {
                $this->safeNotify(
                    fn () => User::notifyAdmins(new MissionNeedsAgentNotification($mission->fresh(['property']))),
                    'mission_needs_agent',
                    $mission,
                );
            }

            return $result;
        }

        $mission = $result['mission'];
        $newAcceptedCount = $result['newAcceptedCount'];

        if ($agent->agentProfile) {
            $agent->agentProfile->incrementMissionsRefused();
        }

        $client = $mission->client;

        User::notifyAdmins(new AgentRefusedMissionNotification($mission, $reason));

        if ($client) {
            $client->notify(new AgentRefusedMissionClientNotification($mission));
        }

        $newAgents = $this->assignmentService->reassignMission($mission->fresh());

        $freshMission = $mission->fresh(['property']);

        if ($newAgents->isNotEmpty()) {
            $this->notifyAgentsOfProposal($newAgents, $freshMission);
            $mission->update(['status' => Mission::STATUS_PENDING_AGENT]);
        } elseif ($newAcceptedCount === 0) {
            $mission->serviceRequest->update([
                'status' => ServiceRequest::STATUS_PAID,
            ]);
            $this->safeNotify(
                fn () => User::notifyAdmins(new MissionNeedsAgentNotification($freshMission)),
                'mission_needs_agent',
                $freshMission,
            );
        } else {
            // Il reste au moins un agent accepté dans la brigade et aucun
            // candidat de remplacement n'est disponible tout de suite :
            // la mission continue avec un effectif réduit plutôt que de
            // bloquer sur un créneau introuvable.
            $mission->update(['status' => Mission::STATUS_AGENT_ACCEPTED]);
        }

        return $mission->fresh();
    }

    /**
     * Arrivée géolocalisée, par agent (brigades — Volet 7.1). La mission
     * globale passe en "en cours" dès le premier agent arrivé : le
     * propriétaire voit l'intervention démarrer sans attendre que toute la
     * brigade soit sur place. L'arrivée de chaque agent reste visible
     * individuellement sur sa ligne mission_agents.
     */
    public function startMission(Mission $mission, User $agent, float $agentLatitude, float $agentLongitude): Mission
    {
        $missionAgent = MissionAgent::where('mission_id', $mission->id)
            ->where('agent_id', $agent->id)
            ->where('status', MissionAgent::STATUS_ACCEPTED)
            ->first();

        if (! $missionAgent) {
            throw new \Exception('Vous ne faites pas partie des intervenants assignés à cette intervention.');
        }

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

        $missionAgent->update([
            'status' => MissionAgent::STATUS_IN_PROGRESS,
            'arrived_at' => now(),
            'arrival_latitude' => $agentLatitude,
            'arrival_longitude' => $agentLongitude,
        ]);

        if ($mission->status === Mission::STATUS_AGENT_ACCEPTED) {
            $mission->update([
                'status' => Mission::STATUS_IN_PROGRESS,
                'started_at' => now(),
            ]);

            $mission->serviceRequest->update([
                'status' => ServiceRequest::STATUS_IN_PROGRESS,
            ]);

            // Notify client that mission started
            $mission->client->notify(new MissionStartedNotification($mission));
        }

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

            // Brigades : chaque co-équipier (pas seulement le référent) doit
            // voir son compteur de missions terminées progresser — utilisé
            // par AgentAssignmentService pour le score d'ancienneté.
            $mission->missionAgents()
                ->whereIn('status', MissionAgent::ROSTER_STATUSES)
                ->where('agent_id', '!=', $mission->agent_id)
                ->with('agent.agentProfile')
                ->get()
                ->each(function (MissionAgent $missionAgent) {
                    $missionAgent->agent?->agentProfile?->incrementMissionsCompleted();
                });

            $this->holdBrigadePayouts($mission);

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

    /**
     * Paiement différé 48h (cahier des charges "grands espaces", Volet 7,
     * décision utilisateur du 15/10/2026). Au lieu de créditer le solde
     * disponible immédiatement, on crédite le solde "en attente" (escrow)
     * de chaque agent réellement présent à la clôture, pour un montant
     * recalculé sur l'effectif réel (pas figé au nombre d'agents prévu au
     * devis — si certains ont refusé en cours de route, ceux qui restent
     * se partagent tout le pool). La libération effective vers le solde
     * disponible se fait ensuite via releaseHeldPayout(), déclenché soit
     * par le job planifié vimaiz:release-held-mission-payouts (48h),
     * soit par une validation anticipée du client, soit par un admin après
     * arbitrage d'un retour rejeté.
     */
    protected function holdBrigadePayouts(Mission $mission): void
    {
        $roster = $mission->missionAgents()
            ->whereIn('status', MissionAgent::ROSTER_STATUSES)
            ->get();

        if ($roster->isEmpty()) {
            // Garde-fou pour une mission qui n'aurait aucune ligne
            // mission_agents (créée avant cette évolution, ou anomalie) :
            // on retombe sur l'agent référent historique plutôt que de ne
            // payer personne.
            if (! $mission->agent) {
                return;
            }

            $this->holdSinglePayout($mission->agent, $mission, (float) $mission->agent_payout, null);

            return;
        }

        $count = $roster->count();
        $baseShare = floor(((float) $mission->agent_payout / $count) * 100) / 100;
        $distributed = round($baseShare * $count, 2);
        $remainder = round((float) $mission->agent_payout - $distributed, 2);

        foreach ($roster as $index => $missionAgent) {
            $share = $baseShare + ($index === $count - 1 ? $remainder : 0);

            $missionAgent->update([
                'status' => MissionAgent::STATUS_COMPLETED,
                'payout_share' => $share,
                'payout_status' => MissionAgent::PAYOUT_HELD,
            ]);

            $this->holdSinglePayout($missionAgent->agent, $mission, $share, $missionAgent);
        }
    }

    protected function holdSinglePayout(User $agent, Mission $mission, float $amount, ?MissionAgent $missionAgent): void
    {
        $wallet = $agent->wallet;
        if (! $wallet) {
            $wallet = $agent->wallet()->create([
                'balance' => 0,
                'pending_balance' => 0,
                'total_earned' => 0,
                'total_withdrawn' => 0,
            ]);
        }

        $alreadyCredited = $wallet->transactions()
            ->where('mission_id', $mission->id)
            ->when($missionAgent, fn ($q) => $q->where('mission_agent_id', $missionAgent->id))
            ->where('type', 'credit')
            ->exists();

        if ($alreadyCredited) {
            return;
        }

        $wallet->creditPending(
            $amount,
            'Mission '.$mission->mission_number.' — en attente de validation (48h)',
            $mission,
            $missionAgent
        );
    }

    /**
     * Libère un paiement retenu vers le solde disponible de l'agent.
     * Appelé par le job planifié (48h écoulées), par une validation
     * anticipée du client, par la validation d'un retour, ou manuellement
     * par un admin après arbitrage d'un retour rejeté.
     */
    public function releaseHeldPayout(MissionAgent $missionAgent): void
    {
        if ($missionAgent->payout_status !== MissionAgent::PAYOUT_HELD) {
            return;
        }

        $agent = $missionAgent->agent;
        $wallet = $agent?->wallet;

        $pendingTransaction = $wallet?->transactions()
            ->where('mission_agent_id', $missionAgent->id)
            ->where('status', 'pending')
            ->first();

        if (! $wallet || ! $pendingTransaction) {
            Log::error('Impossible de libérer le paiement retenu : transaction en attente introuvable', [
                'mission_agent_id' => $missionAgent->id,
            ]);

            return;
        }

        $wallet->releasePending((float) $missionAgent->payout_share, $pendingTransaction);

        $missionAgent->update([
            'payout_status' => MissionAgent::PAYOUT_RELEASED,
            'payout_released_at' => now(),
        ]);

        $this->safeNotify(
            fn () => $agent->notify(new AgentPayoutNotification($missionAgent->mission, (float) $missionAgent->payout_share)),
            'agent_payout_released',
            $missionAgent->mission,
            $agent,
        );
    }

    /**
     * Libère tous les paiements encore retenus d'une mission.
     */
    public function releaseEligiblePayoutsFor(Mission $mission): void
    {
        $held = $mission->missionAgents()
            ->where('payout_status', MissionAgent::PAYOUT_HELD)
            ->get();

        foreach ($held as $missionAgent) {
            $this->releaseHeldPayout($missionAgent);
        }
    }

    /**
     * Validation explicite du client avant l'échéance des 48h (Volet 7) :
     * débloque immédiatement le paiement retenu des intervenants.
     */
    public function validateInterventionByClient(Mission $mission, User $client): Mission
    {
        if ((int) $mission->client_id !== (int) $client->id) {
            throw new \Exception('Accès non autorisé.');
        }

        if (! $mission->canValidateNow()) {
            throw new \Exception('Cette intervention ne peut pas être validée dans son état actuel.');
        }

        $mission->update(['client_validated_at' => now()]);

        $this->releaseEligiblePayoutsFor($mission);

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
