<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $reviews = Review::where('agent_id', $user->id)
            ->with(['client', 'booking.address'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        // Calculate stats
        $totalReviews = Review::where('agent_id', $user->id)->count();
        $approvedReviews = Review::where('agent_id', $user->id)->where('status', 'approved')->count();
        $averageRating = Review::where('agent_id', $user->id)
            ->where('status', 'approved')
            ->avg('rating') ?? 0;
        
        $ratingDistribution = [];
        for ($i = 5; $i >= 1; $i--) {
            $count = Review::where('agent_id', $user->id)
                ->where('status', 'approved')
                ->where('rating', $i)
                ->count();
            $ratingDistribution[$i] = $count;
        }
        
        return Inertia::render('Agent/Reviews/Index', [
            'reviews' => $reviews,
            'stats' => [
                'total_reviews' => $totalReviews,
                'approved_reviews' => $approvedReviews,
                'average_rating' => round($averageRating, 1),
                'rating_distribution' => $ratingDistribution,
            ],
        ]);
    }
}
