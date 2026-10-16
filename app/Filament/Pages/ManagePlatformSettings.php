<?php

namespace App\Filament\Pages;

use App\Models\PlatformSetting;
use BackedEnum;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use UnitEnum;

/**
 * Admin > Paramètres : réglages "singleton" de la plateforme (une seule
 * ligne en base, voir App\Models\PlatformSetting). Regroupe ce qui était
 * jusqu'ici dispersé entre code dur (coordonnées affichées sur /contact)
 * et variables d'environnement (identité bancaire SEPA) dans un seul
 * écran modifiable par un admin, sans redéploiement.
 */
class ManagePlatformSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationLabel = 'Paramètres';

    protected static ?string $title = 'Paramètres de la plateforme';

    protected static string|UnitEnum|null $navigationGroup = 'Paramètres';

    protected static ?int $navigationSort = 1;

    protected string $view = 'filament.pages.manage-platform-settings';

    /**
     * @var array<string, mixed>
     */
    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill(PlatformSetting::current()->toArray());
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Identité de la plateforme')
                    ->schema([
                        Forms\Components\TextInput::make('company_name')
                            ->label('Nom affiché')
                            ->required()
                            ->maxLength(255),
                    ]),

                Section::make('Contact public')
                    ->description('Affiché sur la page "Nous contacter" du site, et utilisé comme adresse de réception du formulaire de contact.')
                    ->schema([
                        Forms\Components\TextInput::make('contact_email')
                            ->label('Email de contact')
                            ->email()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('contact_phone')
                            ->label('Téléphone')
                            ->tel()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('contact_hours')
                            ->label('Horaires')
                            ->placeholder('Lun-Ven : 9h-18h')
                            ->maxLength(255),
                        Forms\Components\Textarea::make('contact_address')
                            ->label('Adresse postale')
                            ->rows(3)
                            ->columnSpanFull(),
                    ])
                    ->columns(3),

                Section::make('Coordonnées bancaires Vimaiz (virements SEPA)')
                    ->description(
                        'L\'identité bancaire de VIMAIZ elle-même (pas celle des intervenants), '
                        .'utilisée pour générer le fichier de virements groupés depuis '
                        .'Finances > Demandes de retrait.'
                    )
                    ->schema([
                        Forms\Components\TextInput::make('sepa_creditor_name')
                            ->label('Nom du titulaire')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('sepa_creditor_iban')
                            ->label('IBAN')
                            ->placeholder('FR76 XXXX XXXX XXXX XXXX XXXX XXX')
                            ->maxLength(34),
                        Forms\Components\TextInput::make('sepa_creditor_bic')
                            ->label('BIC')
                            ->placeholder('BNPAFRPP')
                            ->maxLength(11),
                    ])
                    ->columns(3),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $setting = PlatformSetting::current();
        $setting->update($this->form->getState());

        Notification::make()
            ->title('Paramètres enregistrés')
            ->success()
            ->send();
    }
}
