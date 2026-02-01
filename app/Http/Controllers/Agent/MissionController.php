<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\MissionPhoto;
use App\Services\MissionService;
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

        $query = Mission::where('agent_id', $user->id)
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

    public function show(Mission $mission): Response
    {
        $this->authorize('view', $mission);

        $mission->load([
            'property',
            'client',
            'quote',
            'serviceRequest',
            'photos' => fn ($q) => $q->orderBy('type')->orderByDesc('created_at'),
        ]);

        return Inertia::render('Agent/Missions/Show', [
            'mission' => $mission,
            'canAccept' => $mission->status === Mission::STATUS_PENDING_AGENT,
            'canStart' => $mission->canStart(),
            'canComplete' => $mission->canComplete(),
            'requiredPhotos' => 3,
        ]);
    }

    public function accept(Mission $mission): RedirectResponse
    {
        $this->authorize('accept', $mission);

        try {
            $this->missionService->agentAcceptMission($mission);

            return back()->with('success', 'Mission acceptée. Rendez-vous le ' . 
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
                ->with('info', 'Mission refusée.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function start(Mission $mission): RedirectResponse
    {
        $this->authorize('start', $mission);

        try {
            $this->missionService->startMission($mission);

            return back()->with('success', 'Mission démarrée. N\'oubliez pas les photos avant !');
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

    public function complete(Mission $mission): RedirectResponse
    {
        $this->authorize('complete', $mission);

        try {
            $this->missionService->completeMission($mission);

            return redirect()
                ->route('agent.missions.show', $mission)
                ->with('success', 'Mission terminée ! Le paiement sera versé après validation.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    private function getStatusOptions(): array
    {
        return [
            '' => 'Toutes',
            Mission::STATUS_PENDING_AGENT => 'En attente',
            Mission::STATUS_AGENT_ACCEPTED => 'Acceptées',
            Mission::STATUS_IN_PROGRESS => 'En cours',
            Mission::STATUS_COMPLETED => 'Terminées',
        ];
    }
}
