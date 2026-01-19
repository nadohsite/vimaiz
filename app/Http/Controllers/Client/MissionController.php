<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Mission;
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

        return Inertia::render('client/missions/index', [
            'missions' => $missions,
        ]);
    }

    public function show(Mission $mission)
    {
        $this->authorize('view', $mission);

        $mission->load(['property', 'serviceRequest', 'quote']);

        return Inertia::render('client/missions/show', [
            'mission' => $mission,
        ]);
    }
}
