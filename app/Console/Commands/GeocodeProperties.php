<?php

namespace App\Console\Commands;

use App\Models\Property;
use App\Services\GeocodingService;
use Illuminate\Console\Command;

class GeocodeProperties extends Command
{
    protected $signature = 'properties:geocode {--force : Re-geocode all properties}';

    protected $description = 'Geocode properties that are missing coordinates';

    public function handle(GeocodingService $geocodingService): int
    {
        $query = Property::query();

        if (!$this->option('force')) {
            $query->where(function ($q) {
                $q->whereNull('latitude')
                  ->orWhereNull('longitude');
            });
        }

        $properties = $query->get();

        if ($properties->isEmpty()) {
            $this->info('No properties to geocode.');
            return Command::SUCCESS;
        }

        $this->info("Geocoding {$properties->count()} properties...");

        $bar = $this->output->createProgressBar($properties->count());
        $bar->start();

        $success = 0;
        $failed = 0;

        foreach ($properties as $property) {
            $result = $geocodingService->geocode(
                $property->address_line1,
                $property->city,
                $property->postal_code,
                $property->country ?? 'France'
            );

            if ($result) {
                $property->update([
                    'latitude' => $result['latitude'],
                    'longitude' => $result['longitude'],
                ]);
                $success++;
            } else {
                $failed++;
                $this->newLine();
                $this->warn("Failed: {$property->address_line1}, {$property->city}");
            }

            $bar->advance();

            // Rate limiting for Nominatim (1 request per second)
            usleep(1100000);
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Completed: {$success} geocoded, {$failed} failed.");

        return Command::SUCCESS;
    }
}
