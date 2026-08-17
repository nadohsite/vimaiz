<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\MissionPhoto;
use App\Services\MissionService;
use App\Support\InterventionReportCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MissionController extends Controller
{
    public function __construct(
        protected MissionService $missionService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $status = $request->query('status');

        $query = Mission::query()
            ->visibleToAgent($user)
            ->with(['property', 'client']);

        if ($status) {
            $query->where('status', $status);
        }

        $missions = $query->orderByDesc('scheduled_at')->paginate(10);

        return Inertia::render('Agent/Missions/Index', [
            'missions' => $missions,
            'currentStatus' => $status,
            'statuses' => $this->getStatusOptions(),
        ]);
    }

    public function show(Request $request, Mission $mission): Response
    {
        $this->authorize('view', $mission);

        $mission->load([
            'property',
            'client',
            'quote',
            'serviceRequest',
            'anomalies',
            'photos' => fn ($q) => $q->orderBy('type')->orderByDesc('created_at'),
        ]);

        $mission->append(['status_label', 'actual_duration_label', 'estimated_duration_label']);

        return Inertia::render('Agent/Missions/Show', [
            'mission' => $mission,
            'canAccept' => $request->user()->can('accept', $mission),
            'canRefuse' => $request->user()->can('refuse', $mission),
            'canStart' => $request->user()->can('start', $mission),
            'canComplete' => $mission->canComplete(),
            'checklistProgress' => $mission->checklistProgress(),
            'reportCatalog' => InterventionReportCatalog::categories(),
            'reportSummary' => $mission->reportSummary(),
        ]);
    }

    public function accept(Request $request, Mission $mission): RedirectResponse
    {
        $this->authorize('accept', $mission);

        try {
            $this->missionService->agentAcceptMission($mission, $request->user());

            return back()->with('success', 'Intervention confirmée. Rendez-vous le '.
                $mission->scheduled_at->format('d/m/Y à H:i'));
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function refuse(Request $request, Mission $mission): RedirectResponse
    {
        $this->authorize('refuse', $mission);

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $this->missionService->agentRefuseMission($mission, $validated['reason'] ?? null);

            return redirect()
                ->route('agent.missions.index')
                ->with('info', 'Intervention déclinée. Elle a été proposée à d\'autres intervenants.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function start(Request $request, Mission $mission): RedirectResponse
    {
        $this->authorize('start', $mission);

        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        try {
            $this->missionService->startMission(
                $mission,
                (float) $validated['latitude'],
                (float) $validated['longitude'],
            );

            return back()->with(
                'success',
                'Vous êtes au bon endroit : l\'intervention est démarrée. Bonne intervention !'
            );
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function uploadPhoto(Request $request, Mission $mission): JsonResponse
    {
        $this->authorize('uploadPhotos', $mission);

        $validated = $request->validate([
            'photo' => ['required', 'image', 'max:10240'], // 10MB max
            'type' => ['required', 'in:before,after'],
            'description' => ['nullable', 'string', 'max:255'],
            'room' => ['nullable', 'string', 'max:100'],
        ]);

        try {
            $photo = $this->missionService->uploadPhoto(
                $mission,
                $request->file('photo'),
                $validated['type'],
                $request->user()->id,
                $validated['description'] ?? null
            );

            return response()->json([
                'success' => true,
                'photo' => $photo,
                'message' => 'Photo uploadée avec succès.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function deletePhoto(Mission $mission, MissionPhoto $photo): JsonResponse
    {
        $this->authorize('uploadPhotos', $mission);

        if ($photo->mission_id !== $mission->id) {
            return response()->json(['error' => 'Photo non trouvée'], 404);
        }

        if ($photo->validated_at) {
            return response()->json(['error' => 'Photo déjà validée'], 403);
        }

        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Photo supprimée.',
        ]);
    }

    public function complete(Request $request, Mission $mission): RedirectResponse
    {
        $this->authorize('complete', $mission);

        $validated = $request->validate([
            'nothing_to_report' => ['present', 'boolean'],
            'anomalies' => ['nullable', 'array', 'max:20'],
            'anomalies.*.category' => ['required_with:anomalies', 'string', 'max:50'],
            'anomalies.*.type' => ['required_with:anomalies', 'string', 'max:80'],
            'anomalies.*.notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $this->missionService->completeMission($mission, [
                'nothing_to_report' => $request->boolean('nothing_to_report'),
                'anomalies' => $validated['anomalies'] ?? [],
            ]);

            return redirect()
                ->route('agent.missions.show', $mission)
                ->with('success', 'Intervention terminée. Le rapport a été transmis au propriétaire.');
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function updateChecklist(Request $request, Mission $mission): RedirectResponse|JsonResponse
    {
        $this->authorize('complete', $mission);

        $validated = $request->validate([
            'section_id' => ['required', 'string', 'max:100'],
            'item_id' => ['required', 'string', 'max:100'],
            'checked' => ['required', 'boolean'],
        ]);

        try {
            $mission = $this->missionService->updateChecklistItem(
                $mission,
                $validated['section_id'],
                $validated['item_id'],
                $validated['checked']
            );

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'checklist' => $mission->checklist,
                    'progress' => $mission->checklistProgress(),
                ]);
            }

            return back()->with('success', 'Checklist mise à jour.');
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json(['error' => $e->getMessage()], 422);
            }

            return back()->with('error', $e->getMessage());
        }
    }

    private function getStatusOptions(): array
    {
        return [
            '' => 'Toutes',
            Mission::STATUS_PENDING_AGENT => 'Intervention en attente',
            Mission::STATUS_AGENT_ACCEPTED => 'Confirmée',
            Mission::STATUS_IN_PROGRESS => 'Intervention en cours',
            Mission::STATUS_COMPLETED => 'Intervention terminée',
        ];
    }
}
