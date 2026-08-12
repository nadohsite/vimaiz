<?php

namespace App\Console\Commands;

use App\Models\Mission;
use App\Models\Property;
use App\Models\Quote;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Notifications\AgentPayoutNotification;
use App\Notifications\AgentProfileIncompleteReminder;
use App\Notifications\ClientBookingReminder;
use App\Notifications\ClientProfileIncompleteReminder;
use App\Notifications\DocumentsRejectedNotification;
use App\Notifications\DocumentsVerifiedNotification;
use App\Notifications\MissionAssignedNotification;
use App\Notifications\MissionCompletedNotification;
use App\Notifications\MissionStartedNotification;
use App\Notifications\NewQuoteNotification;
use App\Notifications\PaymentReceivedNotification;
use App\Notifications\WeeklyWorksRecapNotification;
use Illuminate\Console\Command;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification as BaseNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification;

class SendTestEmails extends Command
{
    protected $signature = 'vimaiz:test-emails
                            {email? : Adresse email destinataire (sinon --to)}
                            {--to= : Adresse email destinataire}
                            {--type=all : Groupe à envoyer : client, agent, recap, all}
                            {--mail= : Clé d\'un seul mail (ex: client-profile, weekly-recap-client)}
                            {--mailer= : Mailer à utiliser pour ce test (ex: log, smtp)}
                            {--list : Liste les mails disponibles}';

    protected $description = 'Envoie des mails Vimaiz en test (clients, intervenants, récap hebdo)';

    public function handle(): int
    {
        if ($this->option('list')) {
            $this->listMails();

            return self::SUCCESS;
        }

        $email = $this->argument('email') ?: $this->option('to');

        if (! $email) {
            $this->error('Indiquez une adresse : php artisan vimaiz:test-emails vous@email.com');

            return self::FAILURE;
        }

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error("Adresse email invalide : {$email}");

            return self::FAILURE;
        }

        $type = $this->option('type') ?: 'all';
        $mailKey = $this->option('mail');
        $catalog = $this->catalog();

        if ($mailKey) {
            if (! isset($catalog[$mailKey])) {
                $this->error("Mail inconnu : {$mailKey}");
                $this->listMails();

                return self::FAILURE;
            }
            $keys = [$mailKey];
        } else {
            $keys = array_keys(array_filter(
                $catalog,
                fn (array $item) => $type === 'all' || in_array($type, $item['groups'], true),
            ));
        }

        if (empty($keys)) {
            $this->warn("Aucun mail pour le type « {$type} ».");

            return self::FAILURE;
        }

        $user = $this->resolveRecipient($email);
        $mission = $this->resolveMission();
        $quote = $this->resolveQuote();

        if ($mailer = $this->option('mailer')) {
            config(['mail.default' => $mailer]);
            $this->comment("Mailer forcé : {$mailer}");
        }

        $this->info("Destinataire : {$user->email} ({$user->preferredFirstName()})");
        $this->info('Mails à envoyer : '.implode(', ', $keys));
        $this->comment('Mailer actif : '.config('mail.default'));
        $this->newLine();

        $sent = 0;
        $failed = 0;

        foreach ($keys as $key) {
            $item = $catalog[$key];

            try {
                $notification = ($item['factory'])($user, $mission, $quote);
                Notification::sendNow($user, $this->mailOnly($notification));
                $this->line("  ✓ [{$key}] {$item['label']}");
                $sent++;
            } catch (\Throwable $e) {
                $this->error("  ✗ [{$key}] {$item['label']} — {$e->getMessage()}");
                $failed++;
            }
        }

        $this->newLine();
        $this->info("Terminé — envoyés: {$sent} | échecs: {$failed}");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    protected function listMails(): void
    {
        $this->info('Mails disponibles :');
        $this->newLine();

        foreach ($this->catalog() as $key => $item) {
            $groups = implode(', ', $item['groups']);
            $this->line("  <fg=cyan>{$key}</>  {$item['label']}  <fg=gray>({$groups})</>");
        }

        $this->newLine();
        $this->comment('Exemples :');
        $this->line('  php artisan vimaiz:test-emails vous@email.com');
        $this->line('  php artisan vimaiz:test-emails vous@email.com --type=client');
        $this->line('  php artisan vimaiz:test-emails vous@email.com --type=agent');
        $this->line('  php artisan vimaiz:test-emails vous@email.com --type=recap');
        $this->line('  php artisan vimaiz:test-emails vous@email.com --mail=client-profile');
        $this->line('  php artisan vimaiz:test-emails vous@email.com --mail=weekly-recap-client');
        $this->line('  php artisan vimaiz:test-emails vous@email.com --type=recap --mailer=log');
        $this->line('  php artisan vimaiz:test-emails vous@email.com --type=client --mailer=smtp');
    }

    /**
     * Force le canal mail uniquement (évite database / broadcast / queue en test).
     */
    protected function mailOnly(BaseNotification $notification): BaseNotification
    {
        return new class($notification) extends BaseNotification
        {
            public function __construct(private BaseNotification $inner) {}

            public function via(object $notifiable): array
            {
                return ['mail'];
            }

            public function toMail(object $notifiable)
            {
                return $this->inner->toMail($notifiable);
            }
        };
    }

    /**
     * @return array<string, array{label: string, groups: list<string>, factory: callable}>
     */
    protected function catalog(): array
    {
        return [
            'client-profile' => [
                'label' => 'Relance profil client (ajouter un logement)',
                'groups' => ['client'],
                'factory' => fn () => new ClientProfileIncompleteReminder(),
            ],
            'client-booking' => [
                'label' => 'Relance planification client',
                'groups' => ['client'],
                'factory' => fn () => new ClientBookingReminder(3),
            ],
            'quote-sent' => [
                'label' => 'Devis envoyé',
                'groups' => ['client'],
                'factory' => fn ($user, $mission, $quote) => new NewQuoteNotification($quote),
            ],
            'payment-received' => [
                'label' => 'Paiement reçu / nouvelle intervention',
                'groups' => ['client'],
                'factory' => fn ($user, $mission) => new PaymentReceivedNotification($mission),
            ],
            'mission-started' => [
                'label' => 'Intervention démarrée',
                'groups' => ['client'],
                'factory' => fn ($user, $mission) => new MissionStartedNotification($mission),
            ],
            'mission-completed' => [
                'label' => 'Intervention terminée',
                'groups' => ['client'],
                'factory' => fn ($user, $mission) => new MissionCompletedNotification($mission),
            ],
            'weekly-recap-client' => [
                'label' => 'Récap hebdomadaire (client)',
                'groups' => ['client', 'recap'],
                'factory' => fn () => new WeeklyWorksRecapNotification(
                    $this->sampleCompletedMissions(),
                    $this->sampleUpcomingMissions(),
                    now()->subWeek()->startOfWeek()->translatedFormat('d M').' au '.now()->subWeek()->endOfWeek()->translatedFormat('d M Y'),
                    'client',
                ),
            ],
            'agent-profile' => [
                'label' => 'Relance profil intervenant',
                'groups' => ['agent'],
                'factory' => fn () => new AgentProfileIncompleteReminder([
                    'Numéro SIRET',
                    'Pièce d\'identité',
                ]),
            ],
            'documents-verified' => [
                'label' => 'Documents validés',
                'groups' => ['agent'],
                'factory' => fn () => new DocumentsVerifiedNotification(),
            ],
            'documents-rejected' => [
                'label' => 'Documents rejetés',
                'groups' => ['agent'],
                'factory' => fn () => new DocumentsRejectedNotification('Document illisible — merci de renvoyer une photo nette.'),
            ],
            'mission-assigned' => [
                'label' => 'Nouvelle intervention assignée',
                'groups' => ['agent'],
                'factory' => fn ($user, $mission) => new MissionAssignedNotification($mission),
            ],
            'agent-payout' => [
                'label' => 'Paiement crédité (portefeuille)',
                'groups' => ['agent'],
                'factory' => fn ($user, $mission) => new AgentPayoutNotification($mission, (float) ($mission->agent_payout ?: 80)),
            ],
            'weekly-recap-agent' => [
                'label' => 'Récap hebdomadaire (intervenant)',
                'groups' => ['agent', 'recap'],
                'factory' => fn () => new WeeklyWorksRecapNotification(
                    $this->sampleCompletedMissions(true),
                    $this->sampleUpcomingMissions(true),
                    now()->subWeek()->startOfWeek()->translatedFormat('d M').' au '.now()->subWeek()->endOfWeek()->translatedFormat('d M Y'),
                    'agent',
                ),
            ],
        ];
    }

    protected function resolveRecipient(string $email): object
    {
        $existing = User::query()->where('email', $email)->first();

        $name = $existing?->name ?: 'Test Vimaiz';
        $firstName = $existing?->first_name ?: ($existing?->preferredFirstName() ?: 'Test');

        return new class($email, $name, $firstName)
        {
            use Notifiable;

            public function __construct(
                public string $email,
                public string $name,
                public string $first_name,
            ) {}

            public function preferredFirstName(): string
            {
                return $this->first_name;
            }

            public function routeNotificationForMail(): string
            {
                return $this->email;
            }
        };
    }

    protected function resolveMission(): Mission
    {
        $mission = Mission::query()
            ->with('property')
            ->latest('id')
            ->first();

        if ($mission) {
            if (! $mission->property) {
                $mission->setRelation('property', $this->sampleProperty());
            }

            // Dates manquantes : évite les erreurs de rendu sur les mails de test
            if (! $mission->scheduled_at) {
                $mission->scheduled_at = now()->addDays(2)->setTime(10, 0);
            }
            if (! $mission->started_at) {
                $mission->started_at = now()->subHours(2);
            }
            if (! $mission->completed_at) {
                $mission->completed_at = now()->subHour();
            }

            return $mission;
        }

        $mission = new Mission([
            'mission_number' => 'TEST-'.now()->format('Ymd-Hi'),
            'scheduled_at' => now()->addDays(2)->setTime(10, 0),
            'started_at' => now()->subHours(3),
            'completed_at' => now()->subHour(),
            'duration_hours' => 2,
            'total_price' => 120,
            'agent_payout' => 96,
            'platform_fee' => 24,
            'status' => Mission::STATUS_COMPLETED,
        ]);
        $mission->id = 1;
        $mission->setRelation('property', $this->sampleProperty());

        return $mission;
    }

    protected function resolveQuote(): Quote
    {
        $quote = Quote::query()->with('serviceRequest.property')->latest('id')->first();

        if ($quote) {
            if ($quote->serviceRequest && ! $quote->serviceRequest->property) {
                $quote->serviceRequest->setRelation('property', $this->sampleProperty());
            }

            return $quote;
        }

        $serviceRequest = new ServiceRequest([
            'request_number' => 'REQ-TEST-001',
            'scheduled_date' => now()->addDays(5),
            'scheduled_time' => '10:00',
        ]);
        $serviceRequest->id = 1;
        $serviceRequest->setRelation('property', $this->sampleProperty());

        $quote = new Quote([
            'quote_number' => 'DEV-TEST-001',
            'estimated_price' => 120,
            'final_price' => 120,
            'estimated_hours' => 2,
            'commission_rate' => 20,
            'commission_amount' => 24,
            'agent_amount' => 96,
            'status' => 'sent',
            'expires_at' => now()->addDays(7),
        ]);
        $quote->id = 1;
        $quote->setRelation('serviceRequest', $serviceRequest);

        return $quote;
    }

    protected function sampleProperty(): Property
    {
        $property = new Property([
            'name' => 'Appartement Test Vimaiz',
            'type' => 'appartement',
            'city' => 'Chambéry',
            'address_line1' => '12 rue de la Paix',
            'postal_code' => '73000',
            'surface_area' => 65,
        ]);
        $property->id = 1;

        return $property;
    }

    /**
     * @return Collection<int, object>
     */
    protected function sampleCompletedMissions(bool $forAgent = false): Collection
    {
        return collect([
            (object) [
                'mission_number' => 'MISS-TEST-001',
                'property_label' => 'Appartement — Chambéry',
                'completed_at_label' => now()->subDays(3)->format('d/m/Y'),
                'scheduled_at_label' => null,
                'amount_label' => $forAgent ? '96,00 €' : '120,00 €',
            ],
            (object) [
                'mission_number' => 'MISS-TEST-002',
                'property_label' => 'Maison — Aix-les-Bains',
                'completed_at_label' => now()->subDays(1)->format('d/m/Y'),
                'scheduled_at_label' => null,
                'amount_label' => $forAgent ? '128,00 €' : '160,00 €',
            ],
        ]);
    }

    /**
     * @return Collection<int, object>
     */
    protected function sampleUpcomingMissions(bool $forAgent = false): Collection
    {
        return collect([
            (object) [
                'mission_number' => 'MISS-TEST-003',
                'property_label' => 'Studio — Annecy',
                'completed_at_label' => null,
                'scheduled_at_label' => now()->addDays(2)->format('d/m/Y à H:i'),
                'amount_label' => $forAgent ? '72,00 €' : '90,00 €',
            ],
        ]);
    }
}
