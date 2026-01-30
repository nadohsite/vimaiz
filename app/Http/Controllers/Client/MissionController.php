<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MissionController extends Controller
{
    public function index()
    {
        $missions = auth()->user()->clientMissions()
            ->with(['property', 'serviceRequest'])
            ->orderBy('scheduled_at', 'desc')
            ->get();

        return Inertia::render('Client/Missions/Index', [
            'missions' => $missions,
        ]);
    }

    public function show(Mission $mission)
    {
        $this->authorize('view', $mission);

        $mission->load(['property', 'serviceRequest', 'quote', 'photos', 'agent', 'invoice', 'review']);

        return Inertia::render('Client/Missions/Show', [
            'mission' => $mission,
            'canDownloadInvoice' => $mission->invoice !== null,
            'canReview' => $mission->status === Mission::STATUS_COMPLETED && !$mission->review,
        ]);
    }

    public function storeReview(Request $request, Mission $mission)
    {
        $this->authorize('view', $mission);

        if ($mission->status !== Mission::STATUS_COMPLETED) {
            return back()->with('error', 'Vous ne pouvez évaluer que les missions terminées.');
        }

        if ($mission->review) {
            return back()->with('error', 'Vous avez déjà évalué cette mission.');
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        Review::create([
            'mission_id' => $mission->id,
            'client_id' => auth()->id(),
            'agent_id' => $mission->agent_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'status' => 'approved',
        ]);

        return back()->with('success', 'Merci pour votre avis !');
    }
}
