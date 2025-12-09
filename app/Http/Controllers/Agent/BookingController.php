<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Booking;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $status = $request->query('status', 'all');
        
        $query = Booking::where('agent_id', $user->id)
            ->with(['client', 'service', 'address']);
        
        if ($status !== 'all') {
            $query->where('status', $status);
        }
        
        $bookings = $query->orderBy('scheduled_at', 'desc')
            ->paginate(15);
        
        return Inertia::render('Agent/Bookings/Index', [
            'bookings' => $bookings,
            'filters' => ['status' => $status],
        ]);
    }
    
    public function accept(Booking $booking)
    {
        $this->authorize('update', $booking);
        
        $booking->update(['status' => 'confirmed']);
        
        return redirect()->back()->with('success', 'Booking accepted successfully!');
    }
    
    public function reject(Booking $booking, Request $request)
    {
        $this->authorize('update', $booking);
        
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);
        
        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->reason,
        ]);
        
        return redirect()->back()->with('success', 'Booking rejected.');
    }
    
    public function complete(Booking $booking)
    {
        $this->authorize('update', $booking);
        
        $booking->update(['status' => 'completed']);
        
        // Credit agent wallet
        $wallet = $booking->agent->wallet ?? \App\Models\Wallet::create([
            'user_id' => $booking->agent_id,
        ]);
        
        $agentEarnings = $booking->service_price ?? $booking->total_price * 0.9; // 90% to agent
        $wallet->credit($agentEarnings, 'Booking #' . $booking->booking_number . ' completed', $booking);
        
        return redirect()->back()->with('success', 'Booking marked as completed!');
    }
}
