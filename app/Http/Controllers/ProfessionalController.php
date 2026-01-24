<?php

namespace App\Http\Controllers;

use App\Models\AgentLead;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfessionalController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Professionals');
    }

    public function register(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'city' => ['required', 'string', 'max:100'],
            'experience' => ['nullable', 'string', 'max:500'],
        ]);

        // Store lead in database or send notification
        AgentLead::create($validated);

        // Optionally notify admin
        // \Notification::route('mail', config('mail.admin_address'))
        //     ->notify(new \App\Notifications\NewAgentLeadNotification($validated));

        return back()->with('success', true);
    }
}
