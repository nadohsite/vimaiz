<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingRecurrence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    /**
     * Get user's bookings
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = $user->isAgent() 
            ? $user->agentBookings()
            : $user->clientBookings();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('scheduled_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('scheduled_at', '<=', $request->to_date);
        }

        $bookings = $query->with(['client', 'agent', 'service', 'address'])
            ->orderBy('scheduled_at', 'desc')
            ->paginate(15);

        return response()->json($bookings);
    }

    /**
     * Create a new booking
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:users,id',
            'service_id' => 'required|exists:services,id',
            'address_id' => 'required|exists:addresses,id',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:30',
            'special_instructions' => 'nullable|string',
            'is_recurring' => 'nullable|boolean',
            'recurrence' => 'required_if:is_recurring,true|array',
            'recurrence.frequency' => 'required_if:is_recurring,true|in:weekly,biweekly,monthly',
            'recurrence.days_of_week' => 'nullable|array',
            'recurrence.preferred_time' => 'nullable|date_format:H:i',
        ]);

        DB::beginTransaction();
        try {
            // Calculate pricing
            $service = \App\Models\Service::findOrFail($validated['service_id']);
            $servicePrice = $service->base_price;
            $platformFee = $servicePrice * (config('vimaiz.commission_rate') / 100);
            $totalPrice = $servicePrice + $platformFee;

            $booking = Booking::create([
                'client_id' => $request->user()->id,
                'agent_id' => $validated['agent_id'],
                'service_id' => $validated['service_id'],
                'address_id' => $validated['address_id'],
                'scheduled_at' => $validated['scheduled_at'],
                'duration_minutes' => $validated['duration_minutes'],
                'service_price' => $servicePrice,
                'platform_fee' => $platformFee,
                'total_price' => $totalPrice,
                'special_instructions' => $validated['special_instructions'] ?? null,
                'status' => 'pending',
                'is_recurring' => $validated['is_recurring'] ?? false,
            ]);

            // Create recurrence if needed
            if ($validated['is_recurring'] ?? false) {
                BookingRecurrence::create([
                    'booking_id' => $booking->id,
                    'frequency' => $validated['recurrence']['frequency'],
                    'days_of_week' => $validated['recurrence']['days_of_week'] ?? null,
                    'preferred_time' => $validated['recurrence']['preferred_time'],
                    'start_date' => now()->toDateString(),
                    'next_occurrence' => $validated['scheduled_at'],
                ]);
            }

            DB::commit();

            // TODO: Send notification to agent
            // TODO: Create payment intent

            return response()->json([
                'message' => 'Booking created successfully',
                'booking' => $booking->load(['service', 'address', 'agent']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get booking details
     */
    public function show($id)
    {
        $booking = Booking::with([
            'client',
            'agent.agentProfile',
            'service',
            'address',
            'review',
            'transactions'
        ])->findOrFail($id);

        // Check authorization
        $user = request()->user();
        if ($booking->client_id !== $user->id && 
            $booking->agent_id !== $user->id && 
            !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($booking);
    }

    /**
     * Agent accepts booking
     */
    public function accept(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        $user = $request->user();

        if ($booking->agent_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'Booking cannot be accepted'], 400);
        }

        $booking->update(['status' => 'confirmed']);

        // TODO: Send notification to client

        return response()->json([
            'message' => 'Booking accepted',
            'booking' => $booking,
        ]);
    }

    /**
     * Agent rejects booking
     */
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $booking = Booking::findOrFail($id);
        $user = $request->user();

        if ($booking->agent_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'Booking cannot be rejected'], 400);
        }

        $booking->update([
            'status' => 'rejected',
            'cancellation_reason' => $validated['reason'] ?? null,
        ]);

        // TODO: Send notification to client
        // TODO: Refund payment if already charged

        return response()->json([
            'message' => 'Booking rejected',
            'booking' => $booking,
        ]);
    }

    /**
     * Cancel booking
     */
    public function cancel(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $booking = Booking::findOrFail($id);
        $user = $request->user();

        // Check authorization
        if ($booking->client_id !== $user->id && $booking->agent_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$booking->canBeCancelled()) {
            return response()->json(['message' => 'Booking cannot be cancelled'], 400);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => $validated['reason'] ?? null,
            'cancelled_at' => now(),
        ]);

        // TODO: Process refund if applicable

        return response()->json([
            'message' => 'Booking cancelled',
            'booking' => $booking,
        ]);
    }

    /**
     * Update booking status (agent only)
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:in_progress,completed',
        ]);

        $booking = Booking::findOrFail($id);
        $user = $request->user();

        if ($booking->agent_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $updates = ['status' => $validated['status']];

        if ($validated['status'] === 'in_progress') {
            $updates['started_at'] = now();
        } elseif ($validated['status'] === 'completed') {
            $updates['completed_at'] = now();
            // TODO: Process payment to agent
        }

        $booking->update($updates);

        return response()->json([
            'message' => 'Status updated',
            'booking' => $booking,
        ]);
    }

    /**
     * Get upcoming bookings
     */
    public function upcoming(Request $request)
    {
        $user = $request->user();
        
        $query = $user->isAgent() 
            ? $user->agentBookings()
            : $user->clientBookings();

        $bookings = $query->upcoming()
            ->with(['client', 'agent', 'service', 'address'])
            ->orderBy('scheduled_at')
            ->get();

        return response()->json($bookings);
    }
}
