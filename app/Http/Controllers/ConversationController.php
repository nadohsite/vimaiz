<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
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
            ->with(['client:id,name,email', 'agent:id,name,email', 'booking:id,check_in,check_out'])
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('sender_id', '!=', $user->id)
                  ->where('is_read', false);
            }])
            ->orderByDesc('last_message_at')
            ->paginate(20);

        return Inertia::render('Messages/Index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $user = $request->user();
        
        // Authorize access
        if ($conversation->client_id !== $user->id && $conversation->agent_id !== $user->id) {
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

        // Get other conversations for sidebar
        $otherConversations = Conversation::query()
            ->where(function ($q) use ($user) {
                $q->where('client_id', $user->id)
                  ->orWhere('agent_id', $user->id);
            })
            ->where('id', '!=', $conversation->id)
            ->with(['client:id,name', 'agent:id,name'])
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('sender_id', '!=', $user->id)
                  ->where('is_read', false);
            }])
            ->orderByDesc('last_message_at')
            ->limit(10)
            ->get();

        return Inertia::render('Messages/Show', [
            'conversation' => $conversation,
            'messages' => $messages,
            'otherConversations' => $otherConversations,
            'currentUserId' => $user->id,
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
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
            // Determine who is client and who is agent
            $recipient = \App\Models\User::find($validated['recipient_id']);
            
            $conversation = Conversation::create([
                'client_id' => $user->hasRole('client') ? $user->id : $validated['recipient_id'],
                'agent_id' => $user->hasRole('agent') ? $user->id : $validated['recipient_id'],
            ]);
        }

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'message' => $validated['message'],
        ]);

        return redirect()->route('messages.show', $conversation);
    }

    public function sendMessage(Request $request, Conversation $conversation): \Illuminate\Http\RedirectResponse
    {
        $user = $request->user();
        
        // Authorize access
        if ($conversation->client_id !== $user->id && $conversation->agent_id !== $user->id) {
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
