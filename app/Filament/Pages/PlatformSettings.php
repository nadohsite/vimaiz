<?php

namespace App\Filament\Pages;

use App\Models\PlatformSetting;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use UnitEnum;

class PlatformSettings extends Page
{
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static string|UnitEnum|null $navigationGroup = 'Configuration';

    protected static ?string $navigationLabel = 'Paramètres';

    protected static ?string $title = 'Paramètres plateforme';

    protected static ?int $navigationSort = 100;

    protected string $view = 'filament-panels::pages.page';

    /**
     * @var array<string, mixed>|null
     */
    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill(PlatformSetting::allSettings());
    }

    public function defaultForm(Schema $schema): Schema
    {
        return $schema
            ->statePath('data');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Commission & missions')
                    ->schema([
                        TextInput::make('commission_rate')
                            ->label('Commission plateforme (%)')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->required(),
                        TextInput::make('agents_per_proposal')
                            ->label('Agents proposés par mission')
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(20)
                            ->required(),
                        Toggle::make('manual_verification')
                            ->label('Vérification manuelle des agents')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),
                Section::make('Réservations')
                    ->schema([
                        TextInput::make('minimum_advance_hours')
                            ->label('Délai minimum avant intervention (heures)')
                            ->numeric()
                            ->minValue(1)
                            ->required(),
                        TextInput::make('maximum_advance_days')
                            ->label('Réservation maximum à l\'avance (jours)')
                            ->numeric()
                            ->minValue(1)
                            ->required(),
                        TextInput::make('cancellation_deadline_hours')
                            ->label('Délai d\'annulation (heures)')
                            ->numeric()
                            ->minValue(1)
                            ->required(),
                    ])
                    ->columns(2),
            ]);
    }

    public function content(Schema $schema): Schema
    {
        return $schema
            ->components([
                Form::make([
                    EmbeddedSchema::make('form'),
                ])
                    ->id('platform-settings-form')
                    ->livewireSubmitHandler('save')
                    ->footer([
                        Actions::make([
                            Action::make('save')
                                ->label('Enregistrer')
                                ->submit('save'),
                        ]),
                    ]),
            ]);
    }

    public function save(): void
    {
        $data = $this->form->getState();

        foreach ($data as $key => $value) {
            PlatformSetting::set($key, $value);
        }

        Notification::make()
            ->title('Paramètres enregistrés')
            ->success()
            ->send();
    }
}
