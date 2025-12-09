<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Get all service categories with services
     */
    public function categories()
    {
        $categories = ServiceCategory::with('services')
            ->active()
            ->orderBy('sort_order')
            ->get();

        return response()->json($categories);
    }

    /**
     * Get all services
     */
    public function index(Request $request)
    {
        $query = Service::with('category')->active();

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $services = $query->orderBy('name')->get();

        return response()->json($services);
    }

    /**
     * Get service details
     */
    public function show($id)
    {
        $service = Service::with('category', 'agents')->findOrFail($id);

        return response()->json($service);
    }
}
