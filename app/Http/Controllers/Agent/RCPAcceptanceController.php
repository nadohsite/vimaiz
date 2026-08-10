<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RCPAcceptanceController extends Controller
{
    public function index(Request $request)
    {
        $agentProfile = $request->user()->agentProfile;

        if (!$agentProfile) {
            return redirect()->route('dashboard')
                ->with('error', 'Profil intervenant introuvable.');
        }

        return Inertia::render('Agent/RCPAcceptance', [
            'agentProfile' => [
                'id' => $agentProfile->id,
                'rcp_clause_accepted' => $agentProfile->rcp_clause_accepted,
                'rcp_clause_accepted_at' => $agentProfile->rcp_clause_accepted_at,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $agentProfile = $request->user()->agentProfile;

        if (!$agentProfile) {
            return back()->with('error', 'Profil intervenant introuvable.');
        }

        // Mettre à jour l'acceptation de la clause RCP
        $agentProfile->update([
            'rcp_clause_accepted' => true,
            'rcp_clause_accepted_at' => now(),
        ]);

        return redirect()->route('agent.dashboard')
            ->with('success', 'Clause RCP acceptée avec succès.');
    }
}
