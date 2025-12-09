<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Get user's conversations
     */
    public function conversations(Request $request)
    {
        $user = $request->user();

        $conversations = $user->isAgent()
            ? $user->agentConversations()
            : $user->clientConversations();

        $conversations = $conversations->with(['client', 'agent', 'booking'])
            ->orderBy('last_message_at', 'desc')
            ->get();

        // Add unread count for each conversation
        $conversations->each(function ($conversation) use ($user) {
            $conversation->unread_count = $conversation->getUnreadCountForUser($user->id);
        });

        return response()->json($conversations);
    }

    /**
     * Get messages for a conversation
     */
    public function messages(Request $request, $conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);
        $user = $request->user();

        // Check authorization
        if ($conversation->client_id !== $user->id && $conversation->agent_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at')
            ->paginate(50);

        // Mark messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json($messages);
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request, $conversationId)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'attachments' => 'nullable|array',
            'attachments.*' => 'string', // URLs or paths
        ]);

        $conversation = Conversation::findOrFail($conversationId);
        $user = $request->user();

        // Check authorization
        if ($conversation->client_id !== $user->id && $conversation->agent_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'message' => $validated['message'],
            'attachments' => $validated['attachments'] ?? null,
        ]);

        // TODO: Send real-time notification via websockets
        // TODO: Send email notification if recipient is offline

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message->load('sender'),
        ], 201);
    }

    /**
     * Mark message as read
     */
    public function markAsRead($messageId)
    {
        $message = Message::findOrFail($messageId);
        $user = request()->user();

        // Check authorization (can only mark messages sent to you as read)
        if ($message->sender_id === $user->id) {
            return response()->json(['message' => 'Cannot mark your own message as read'], 400);
        }

        $conversation = $message->conversation;
        if ($conversation->client_id !== $user->id && $conversation->agent_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->markAsRead();

        return response()->json(['message' => 'Message marked as read']);
    }

    /**
     * Create or get conversation between client and agent
     */
    public function createConversation(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:users,id',
            'booking_id' => 'nullable|exists:bookings,id',
        ]);

        $user = $request->user();

        if (!$user->isClient()) {
            return response()->json(['message' => 'Only clients can initiate conversations'], 403);
        }

        // Check if conversation already exists
        $conversation = Conversation::where('client_id', $user->id)
            ->where('agent_id', $validated['agent_id'])
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'client_id' => $user->id,
                'agent_id' => $validated['agent_id'],
                'booking_id' => $validated['booking_id'] ?? null,
            ]);
        }

        return response()->json([
            'message' => 'Conversation created',
            'conversation' => $conversation->load(['client', 'agent']),
        ], 201);
    }
}
