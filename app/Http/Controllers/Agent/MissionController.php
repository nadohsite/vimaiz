<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\MissionInvitation;
use App\Models\MissionPhoto;
use App\Services\MissionService;
use App\Support\UploadHelper;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
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
            ->where(function ($q) use ($user) {
                $q->where('agent_id', $user->id)
                    ->orWhereHas('invitations', function ($iq) use ($user) {
                        $iq->where('agent_id', $user->id)
                            ->where('status', MissionInvitation::STATUS_PENDING);
                    });
            })
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
            'canAccept' => Gate::allows('accept', $mission),
            'canRefuse' => Gate::allows('refuse', $mission),
            'canStart' => $mission->canStart(),
            'canComplete' => $mission->canComplete(),
        ]);
    }

    public function accept(Mission $mission): RedirectResponse
    {
        $this->authorize('accept', $mission);

        try {
            $this->missionService->agentAcceptMission($mission, auth()->user());

            return back()->with('success', 'Mission acceptée. Rendez-vous le '.
                $mission->fresh()->scheduled_at->format('d/m/Y à H:i'));
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
            $wasAccepted = $mission->agent_id === auth()->id()
                && $mission->status === Mission::STATUS_AGENT_ACCEPTED;

            $this->missionService->agentRefuseMission(
                $mission,
                auth()->user(),
                $validated['reason'] ?? null
            );

            if ($wasAccepted) {
                return redirect()
                    ->route('agent.missions.index')
                    ->with('info', 'Mission déclinée. Elle sera reproposée aux autres agents.');
            }

            return redirect()
                ->route('agent.missions.index')
                ->with('info', 'Mission refusée.');
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

            return back()->with('success', 'Vous êtes au bon endroit : la mission est démarrée. Bonne intervention !');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function uploadPhoto(Request $request, Mission $mission): RedirectResponse
    {
        $this->authorize('uploadPhotos', $mission);

        if ($response = UploadHelper::invalidUploadFlash($request, 'photo')) {
            return $response;
        }

        $validated = $request->validate([
            'photo' => [
                'required',
                'file',
                'max:'.UploadHelper::missionPhotoMaxKb(),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! UploadHelper::isImageUpload($value)) {
                        $fail('Le fichier doit être une image.');
                    }
                },
            ],
            'type' => ['required', 'in:before,after'],
            'description' => ['nullable', 'string', 'max:255'],
        ], UploadHelper::missionPhotoValidationMessages());

        try {
            $this->missionService->uploadPhoto(
                $mission,
                $request->file('photo'),
                $validated['type'],
                $request->user()->id,
                $validated['description'] ?? null
            );

            return back()->with('success', 'Photo uploadée avec succès.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function deletePhoto(Mission $mission, MissionPhoto $photo): RedirectResponse
    {
        $this->authorize('uploadPhotos', $mission);

        if ($photo->mission_id !== $mission->id) {
            return back()->with('error', 'Photo non trouvée.');
        }

        Storage::disk('public')->delete($photo->file_path);
        $photo->delete();

        return back()->with('success', 'Photo supprimée.');
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
