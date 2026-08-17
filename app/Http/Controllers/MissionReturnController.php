<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use App\Models\User;
use App\Notifications\ReturnCompletedNotification;
use App\Notifications\ReturnRequestedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MissionReturnController extends Controller
{
    /**
     * Client demande un retour pour mécontentement
     */
    public function requestReturn(Request $request, Mission $mission)
    {
        // Vérifier que c'est bien le client de cette intervention
        if ($mission->client_id !== Auth::id()) {
            abort(403, 'Accès non autorisé');
        }

        // Vérifier que le retour est possible
        if (! $mission->canRequestReturn()) {
            return back()->with('error', 'La demande de retour n\'est plus possible pour cette intervention.');
        }

        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:1000',
        ]);

        $mission->update([
            'return_requested' => true,
            'return_status' => Mission::RETURN_PENDING,
            'return_reason' => $validated['reason'],
            'return_requested_at' => now(),
        ]);

        // Notify admins of return request
        User::notifyAdmins(new ReturnRequestedNotification($mission));

        return back()->with('success', 'Votre demande de retour a été envoyée à l\'intervenant.');
    }

    /**
     * Agent démarre le retour
     */
    public function startReturn(Mission $mission)
    {
        // Vérifier que c'est bien l'intervenant de cette intervention
        if ($mission->agent_id !== Auth::id()) {
            abort(403, 'Accès non autorisé');
        }

        if ($mission->return_status !== Mission::RETURN_PENDING) {
            return back()->with('error', 'Cette action n\'est pas possible.');
        }

        $mission->update([
            'return_status' => Mission::RETURN_IN_PROGRESS,
            'return_started_at' => now(),
        ]);

        return back()->with('success', 'Le retour a été démarré.');
    }

    /**
     * Agent termine le retour
     */
    public function completeReturn(Request $request, Mission $mission)
    {
        // Vérifier que c'est bien l'intervenant de cette intervention
        if ($mission->agent_id !== Auth::id()) {
            abort(403, 'Accès non autorisé');
        }

        if ($mission->return_status !== Mission::RETURN_IN_PROGRESS) {
            return back()->with('error', 'Cette action n\'est pas possible.');
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $mission->update([
            'return_status' => Mission::RETURN_COMPLETED,
            'return_completed_at' => now(),
            'return_agent_notes' => $validated['notes'] ?? null,
        ]);

        // Notify admins that return is completed
        User::notifyAdmins(new ReturnCompletedNotification($mission));

        return back()->with('success', 'Le retour a été marqué comme terminé. En attente de validation client.');
    }

    /**
     * Client valide le retour
     */
    public function validateReturn(Request $request, Mission $mission)
    {
        // Vérifier que c'est bien le client de cette intervention
        if ($mission->client_id !== Auth::id()) {
            abort(403, 'Accès non autorisé');
        }

        if ($mission->return_status !== Mission::RETURN_COMPLETED) {
            return back()->with('error', 'Cette action n\'est pas possible.');
        }

        $validated = $request->validate([
            'feedback' => 'nullable|string|max:1000',
            'approved' => 'required|boolean',
        ]);

        $newStatus = $validated['approved'] ? Mission::RETURN_VALIDATED : Mission::RETURN_REJECTED;

        $mission->update([
            'return_status' => $newStatus,
            'return_validated_at' => now(),
            'return_client_feedback' => $validated['feedback'] ?? null,
        ]);

        $message = $validated['approved']
            ? 'Merci ! Le retour a été validé.'
            : 'Le retour a été refusé. Notre équipe va examiner votre dossier.';

        return back()->with('success', $message);
    }

    /**
     * Liste des retours pour l'intervenant
     */
    public function agentReturns()
    {
        $missions = Mission::where('agent_id', Auth::id())
            ->where('return_requested', true)
            ->with(['client', 'property'])
            ->orderByDesc('return_requested_at')
            ->paginate(10);

        return Inertia::render('Agent/Returns/Index', [
            'missions' => $missions,
        ]);
    }
}
