<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Booking;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Create a review for a booking
     */
    public function store(Request $request, $bookingId)
    {
        $booking = Booking::findOrFail($bookingId);
        $user = $request->user();

        // Check authorization
        if ($booking->client_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if booking is completed
        if ($booking->status !== 'completed') {
            return response()->json(['message' => 'Can only review completed bookings'], 400);
        }

        // Check if already reviewed
        if ($booking->review) {
            return response()->json(['message' => 'Booking already reviewed'], 400);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'photos' => 'nullable|array',
            'photos.*' => 'string', // URLs or paths to uploaded photos
        ]);

        $review = Review::create([
            'booking_id' => $booking->id,
            'client_id' => $user->id,
            'agent_id' => $booking->agent_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'photos' => $validated['photos'] ?? null,
            'status' => config('vimaiz.reviews.auto_approve') ? 'approved' : 'pending',
        ]);

        return response()->json([
            'message' => 'Review submitted successfully',
            'review' => $review,
        ], 201);
    }

    /**
     * Get reviews for an agent
     */
    public function agentReviews($agentId)
    {
        $reviews = Review::with(['client', 'booking.service'])
            ->where('agent_id', $agentId)
            ->approved()
            ->latest()
            ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * Update a review
     */
    public function update(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        $user = $request->user();

        if ($review->client_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'photos' => 'nullable|array',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Review updated successfully',
            'review' => $review,
        ]);
    }

    /**
     * Delete a review
     */
    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $user = request()->user();

        if ($review->client_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }

    /**
     * Agent responds to a review
     */
    public function respond(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        $user = $request->user();

        if ($review->agent_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'response' => 'required|string|max:500',
        ]);

        $review->update([
            'agent_response' => $validated['response'],
            'agent_responded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Response added successfully',
            'review' => $review,
        ]);
    }
}
