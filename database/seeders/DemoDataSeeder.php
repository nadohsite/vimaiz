<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\AgentProfile;
use App\Models\Address;
use App\Models\Service;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@vimaiz.com'],
            [
                'name' => 'Admin VIMAIZ',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        // 2. Create Demo Client
        $client = User::firstOrCreate(
            ['email' => 'client@vimaiz.com'],
            [
                'name' => 'Mohammed Client',
                'password' => Hash::make('password'),
                'role' => 'client',
                'phone' => '+212612345678',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
                'is_active' => true,
            ]
        );

        // Create client address if not exists
        if (!$client->addresses()->exists()) {
            Address::create([
                'user_id' => $client->id,
                'label' => 'Domicile',
                'street_address' => 'Avenue Mohammed V',
                'city' => 'Casablanca',
                'postal_code' => '20000',
                'country' => 'MA',
                'latitude' => 33.5731,
                'longitude' => -7.5898,
                'property_type' => 'apartment',
                'size_sqm' => 120,
                'is_default' => true,
            ]);
        }

        // Initialize Client Wallet
        $this->initWallet($client);
        $client->refresh();

        // 3. Create Demo Agents
        $agentsData = [
            [
                'name' => 'Fatima Zahra',
                'email' => 'fatima@vimaiz.com',
                'phone' => '+212623456789',
                'description' => 'Agent de ménage professionnelle avec 5 ans d\'expérience. Spécialisée dans le nettoyage de villas et appartements de luxe.',
                'experience_years' => 5,
                'hourly_rate' => 80.00,
            ],
            [
                'name' => 'Khadija Alami',
                'email' => 'khadija@vimaiz.com',
                'phone' => '+212634567890',
                'description' => 'Experte en nettoyage profond et entretien régulier. Très appréciée pour son attention aux détails.',
                'experience_years' => 3,
                'hourly_rate' => 70.00,
            ],
            [
                'name' => 'Amina Benali',
                'email' => 'amina@vimaiz.com',
                'phone' => '+212645678901',
                'description' => 'Spécialiste du nettoyage Airbnb et interventions rapides. Disponible 7j/7.',
                'experience_years' => 4,
                'hourly_rate' => 75.00,
            ],
        ];

        $agents = [];

        foreach ($agentsData as $agentData) {
            $agent = User::firstOrCreate(
                ['email' => $agentData['email']],
                [
                    'name' => $agentData['name'],
                    'password' => Hash::make('password'),
                    'role' => 'agent',
                    'phone' => $agentData['phone'],
                    'email_verified_at' => now(),
                    'phone_verified_at' => now(),
                    'is_active' => true,
                ]
            );

            if (!$agent->agentProfile) {
                AgentProfile::create([
                    'user_id' => $agent->id,
                    'description' => $agentData['description'],
                    'experience_years' => $agentData['experience_years'],
                    'hourly_rate' => $agentData['hourly_rate'],
                    'service_radius_km' => 15,
                    'verification_status' => 'verified',
                    'verified_at' => now(),
                    'average_rating' => rand(40, 50) / 10,
                    'total_reviews' => rand(10, 50),
                    'total_bookings' => rand(20, 100),
                    'is_available' => true,
                ]);
            }

            $this->initWallet($agent);
            $agent->refresh();
            $agents[] = $agent;
        }

        // 4. Create Bookings & Reviews & Transactions
        $services = Service::all();
        
        if ($services->isEmpty()) {
            $this->command->warn('No services found. Please run ServiceSeeder first.');
            return;
        }

        // Create some past bookings
        for ($i = 0; $i < 10; $i++) {
            $agent = $agents[array_rand($agents)];
            $service = $services->random();
            $date = Carbon::now()->subDays(rand(1, 30));
            $durationMinutes = $service->estimated_duration_minutes;
            $amount = $service->base_price;
            $platformFee = $amount * 0.20; // 20% fee
            $servicePrice = $amount - $platformFee;

            $booking = Booking::create([
                'booking_number' => 'BK-' . strtoupper(uniqid()),
                'client_id' => $client->id,
                'agent_id' => $agent->id,
                'service_id' => $service->id,
                'address_id' => $client->addresses->first()->id,
                'scheduled_at' => $date,
                'duration_minutes' => $durationMinutes,
                'service_price' => $servicePrice,
                'platform_fee' => $platformFee,
                'total_price' => $amount,
                'status' => 'completed',
                'special_instructions' => 'Simulation booking',
            ]);

            // Create Review
            Review::create([
                'booking_id' => $booking->id,
                'client_id' => $client->id,
                'agent_id' => $agent->id,
                'rating' => rand(4, 5),
                'comment' => 'Excellent service, très professionnel !',
                'status' => 'approved',
            ]);

            // Create Transaction (Payment)
            Transaction::create([
                'booking_id' => $booking->id,
                'user_id' => $client->id,
                'type' => 'payment',
                'amount' => $amount,
                'currency' => 'MAD',
                'status' => 'completed',
                'payment_method' => 'card',
            ]);

            // Credit Agent Wallet (80% share)
            $agentShare = $amount * 0.8;
            $wallet = $this->initWallet($agent);
            $wallet->credit($agentShare, "Payment for booking #{$booking->booking_number}", $booking);
        }

        // Create some future bookings
        for ($i = 0; $i < 5; $i++) {
            $agent = $agents[array_rand($agents)];
            $service = $services->random();
            $date = Carbon::now()->addDays(rand(1, 14));
            $durationMinutes = $service->estimated_duration_minutes;
            $amount = $service->base_price;
            $platformFee = $amount * 0.20;
            $servicePrice = $amount - $platformFee;

            Booking::create([
                'booking_number' => 'BK-' . strtoupper(uniqid()),
                'client_id' => $client->id,
                'agent_id' => $agent->id,
                'service_id' => $service->id,
                'address_id' => $client->addresses->first()->id,
                'scheduled_at' => $date,
                'duration_minutes' => $durationMinutes,
                'service_price' => $servicePrice,
                'platform_fee' => $platformFee,
                'total_price' => $amount,
                'status' => 'confirmed',
            ]);
        }

        // 5. Create Conversations
        $agent = $agents[0];
        $conversation = Conversation::create([
            'client_id' => $client->id,
            'agent_id' => $agent->id,
            'last_message' => 'Bonjour, êtes-vous disponible ce samedi ?',
            'last_message_at' => now(),
        ]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $client->id,
            'message' => 'Bonjour, êtes-vous disponible ce samedi ?',
            'is_read' => true,
        ]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $agent->id,
            'message' => 'Bonjour ! Oui, je suis disponible le matin.',
            'is_read' => false,
        ]);

        $this->command->info('Demo data created successfully with Bookings, Reviews, Wallets, and Conversations!');
    }

    private function initWallet(User $user): Wallet
    {
        return Wallet::firstOrCreate(
            ['user_id' => $user->id],
            [
                'balance' => 0,
                'pending_balance' => 0,
                'total_earned' => 0,
                'total_withdrawn' => 0,
                'currency' => 'MAD',
            ]
        );
    }
}
