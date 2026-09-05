<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Mission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $conversations = Conversation::query()
            ->where(function ($q) use ($user) {
                $q->where('client_id', $user->id)
                  ->orWhere('agent_id', $user->id);
            })
            ->with(['client:id,name,email', 'agent:id,name,email', 'booking:id,scheduled_at,status'])
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('sender_id', '!=', $user->id)
                  ->where('is_read', false);
            }])
            ->orderByRaw('COALESCE(last_message_at, created_at) DESC')
            ->paginate(20);

        return Inertia::render('Messages/Index', [
            'conversations' => $conversations,
            'currentUserId' => $user->id,
        ]);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $user = $request->user();
        
        // Authorize access
        if ((int) $conversation->client_id !== (int) $user->id && (int) $conversation->agent_id !== (int) $user->id) {
            abort(403);
        }

        $conversation->load(['client:id,name,email', 'agent:id,name,email', 'booking']);

        // Mark messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $messages = $conversation->messages()
            ->with('sender:id,name')
            ->orderBy('created_at', 'asc')
            ->get();

        // Get conversations for sidebar (including current)
        $otherConversations = Conversation::query()
            ->where(function ($q) use ($user) {
                $q->where('client_id', $user->id)
                  ->orWhere('agent_id', $user->id);
            })
            ->with(['client:id,name', 'agent:id,name'])
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('sender_id', '!=', $user->id)
                  ->where('is_read', false);
            }])
            ->orderByRaw('COALESCE(last_message_at, created_at) DESC')
            ->limit(20)
            ->get();

        return Inertia::render('Messages/Show', [
            'conversation' => $conversation,
            'messages' => $messages,
            'otherConversations' => $otherConversations,
            'currentUserId' => $user->id,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'recipient_id' => ['required', 'exists:users,id'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        // Check if conversation already exists
        $conversation = Conversation::where(function ($q) use ($user, $validated) {
            $q->where('client_id', $user->id)
              ->where('agent_id', $validated['recipient_id']);
        })->orWhere(function ($q) use ($user, $validated) {
            $q->where('client_id', $validated['recipient_id'])
              ->where('agent_id', $user->id);
        })->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'client_id' => $user->isClient() ? $user->id : $validated['recipient_id'],
                'agent_id' => $user->isAgent() ? $user->id : $validated['recipient_id'],
            ]);
        }

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'message' => $validated['message'],
        ]);

        return redirect()->route('messages.show', $conversation);
    }

    /**
     * Open or create the conversation between the mission client and assigned agent.
     */
    public function forMission(Request $request, Mission $mission): RedirectResponse
    {
        $user = $request->user();

        $this->authorize('view', $mission);

        if (! $mission->agent_id || ! $mission->client_id) {
            return back()->with('error', 'Aucun interlocuteur disponible pour cette intervention.');
        }

        $isParticipant = (int) $user->id === (int) $mission->client_id
            || (int) $user->id === (int) $mission->agent_id;

        if (! $isParticipant) {
            abort(403);
        }

        $conversation = Conversation::firstOrCreate(
            [
                'client_id' => $mission->client_id,
                'agent_id' => $mission->agent_id,
            ],
        );

        return redirect()->route('messages.show', $conversation);
    }

    public function sendMessage(Request $request, Conversation $conversation): RedirectResponse
    {
        $user = $request->user();
        
        // Authorize access
        if ((int) $conversation->client_id !== (int) $user->id && (int) $conversation->agent_id !== (int) $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'message' => $validated['message'],
        ]);

        return back();
    }
}
