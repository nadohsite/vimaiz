<?php

namespace App\Http\Controllers;

use App\Models\ServiceCategory;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        $categories = ServiceCategory::with('services')
            ->active()
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Services/Index', [
            'categories' => $categories,
        ]);
    }
}
