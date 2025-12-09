<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Service;
use App\Models\AgentProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = $user->isAgent() 
            ? $user->agentBookings()
            : $user->clientBookings();

        $bookings = $query->with(['client', 'agent', 'service'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
        ]);
    }

    public function create(Request $request)
    {
        $agentId = $request->query('agent_id');
        $serviceId = $request->query('service_id');
        $date = $request->query('date');
        $startTime = $request->query('start_time');
        $endTime = $request->query('end_time');

        return Inertia::render('Bookings/Create', [
            'agent' => $agentId ? AgentProfile::with('user')->find($agentId) : null,
            'service' => $serviceId ? Service::find($serviceId) : null,
            'services' => Service::active()->get(),
            'user_addresses' => $request->user()->addresses,
            'date' => $date,
            'start_time' => $startTime,
            'end_time' => $endTime,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:users,id',
            'service_id' => 'required|exists:services,id',
            'address_id' => 'required|exists:addresses,id',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:60',
            'special_instructions' => 'nullable|string',
        ]);

        $booking = DB::transaction(function () use ($validated, $request) {
            $service = Service::findOrFail($validated['service_id']);
            $agent = \App\Models\AgentProfile::where('user_id', $validated['agent_id'])->firstOrFail();
            
            // Calculate pricing
            $hours = $validated['duration_minutes'] / 60;
            $servicePrice = $agent->hourly_rate * $hours;
            $platformFee = $servicePrice * 0.10; // 10% platform fee
            $totalPrice = $servicePrice + $platformFee;
            
            // Generate unique booking number
            $bookingNumber = 'BK-' . strtoupper(uniqid());
            
            return Booking::create([
                'booking_number' => $bookingNumber,
                'client_id' => $request->user()->id,
                'agent_id' => $validated['agent_id'],
                'service_id' => $validated['service_id'],
                'address_id' => $validated['address_id'],
                'scheduled_at' => $validated['scheduled_at'],
                'duration_minutes' => $validated['duration_minutes'],
                'service_price' => $servicePrice,
                'platform_fee' => $platformFee,
                'total_price' => $totalPrice,
                'status' => 'pending',
                'special_instructions' => $validated['special_instructions'] ?? null,
            ]);
        });

        return redirect()->route('bookings.show', $booking)
            ->with('success', 'Booking created successfully! Booking #' . $booking->booking_number);
    }

    public function show(Booking $booking)
    {
        $this->authorize('view', $booking);
        
        return Inertia::render('Bookings/Show', [
            'booking' => $booking->load(['client', 'agent.agentProfile', 'service', 'address']),
        ]);
    }
}
