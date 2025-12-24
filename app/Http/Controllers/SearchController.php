<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Service;
use App\Services\AgentMatchingService;
use App\Http\Resources\AgentResource;
use Inertia\Inertia;

class SearchController extends Controller
{
    protected $agentMatchingService;

    public function __construct(AgentMatchingService $agentMatchingService)
    {
        $this->agentMatchingService = $agentMatchingService;
    }

    public function index(Request $request)
    {
        $filters = array_merge([
            'radius' => 20,
            'lat' => null,
            'lng' => null,
            'service_id' => null,
            'min_rating' => null,
            'min_experience' => null,
            'search' => '',
            'property_type' => null,
            'size' => null,
        ], $request->only([
                        'lat',
                        'lng',
                        'radius',
                        'service_id',
                        'date',
                        'search',
                        'min_price',
                        'max_price',
                        'min_rating',
                        'min_experience',
                        'sort_by',
                        'sort_direction',
                        'property_type',
                        'size',
                    ]));

        $agents = $this->agentMatchingService->search($filters);

        return Inertia::render('Search/Index', [
            'agents' => AgentResource::collection($agents),
            'filters' => $filters,
            'services' => Service::active()->get(['id', 'name']),
        ]);
    }
}
