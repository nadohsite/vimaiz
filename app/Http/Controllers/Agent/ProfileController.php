<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\UpdateAgentProfileRequest;
use App\Models\AgentProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $agentProfile = $user->agentProfile;

        if (!$agentProfile) {
            $agentProfile = AgentProfile::create([
                'user_id' => $user->id,
                'verification_status' => 'pending',
                'is_available' => true,
            ]);
        }

        return Inertia::render('Agent/Profile/Edit', [
            'agentProfile' => [
                'siret' => $agentProfile->siret,
                'company_type' => $agentProfile->company_type,
                'company_name' => $agentProfile->company_name,
                'description' => $agentProfile->description,
                'coverage_radius_km' => $agentProfile->coverage_radius_km ?? 20,
                'has_own_equipment' => (bool) $agentProfile->has_own_equipment,
                'has_driving_license' => (bool) $agentProfile->has_driving_license,
                'has_vehicle' => (bool) $agentProfile->has_vehicle,
                'vehicle_type' => $agentProfile->vehicle_type,
                'verification_status' => $agentProfile->verification_status,
            ],
            'completionSteps' => $agentProfile->getProfileCompletionSteps(),
        ]);
    }

    public function update(UpdateAgentProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $agentProfile = $user->agentProfile;

        if (!$agentProfile) {
            return back()->with('error', 'Profil agent introuvable.');
        }

        $validated = $request->validated();

        if (!$validated['has_vehicle']) {
            $validated['vehicle_type'] = null;
        }

        $agentProfile->update($validated);

        return back()->with('success', 'Profil professionnel mis à jour.');
    }
}
