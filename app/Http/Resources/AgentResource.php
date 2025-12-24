<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $address = $this->user->addresses->first();

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->user->name,
            'avatar' => $this->user->avatar,
            'bio' => $this->description, // Mapping description to bio as per MCD
            'description' => $this->description,
            'hourly_rate' => (float) $this->hourly_rate,
            'experience_years' => $this->experience_years,
            'average_rating' => (float) $this->average_rating,
            'total_reviews' => $this->total_reviews,
            'profile_photo' => $this->profile_photo,
            'latitude' => $address?->latitude ? (float) $address->latitude : null,
            'longitude' => $address?->longitude ? (float) $address->longitude : null,
            'city' => $address?->city,
            'distance' => $this->distance ?? null,
            'search_score' => $this->search_score ?? null,
            'supported_property_types' => $this->supported_property_types,
            'max_surface_area' => $this->max_surface_area,
            'services' => $this->services->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                ];
            }),
        ];
    }
}
