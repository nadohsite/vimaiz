<?php

namespace App\Filament\Resources\AgentProfileResource\Pages;

use App\Filament\Resources\AgentProfileResource;
use App\Notifications\DocumentsVerifiedNotification;
use App\Notifications\DocumentsRejectedNotification;
use Filament\Actions;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;
use Illuminate\Support\Facades\Storage;

class ViewAgentDocuments extends Page
{
    protected static string $resource = AgentProfileResource::class;

    protected string $view = 'filament.resources.agent-profile-resource.pages.view-agent-documents';

    public $record;

    public function mount($record): void
    {
        $this->record = \App\Models\AgentProfile::findOrFail($record);
    }

    public function getTitle(): string
    {
        return 'Documents de ' . $this->record->user->name;
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('back')
                ->label('Retour')
                ->icon('heroicon-o-arrow-left')
                ->url(fn () => AgentProfileResource::getUrl('view', ['record' => $this->record])),
            Action::make('verify')
                ->label('Valider tous les documents')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->visible(fn () => in_array($this->record->verification_status, ['pending', 'submitted']))
                ->requiresConfirmation()
                ->modalHeading('Valider les documents')
                ->modalDescription('Confirmez que tous les documents de cet intervenant sont valides.')
                ->action(function () {
                    $this->record->update([
                        'verification_status' => 'verified',
                        'rejection_reason' => null,
                    ]);
                    
                    if ($this->record->user) {
                        $this->record->user->notify(new DocumentsVerifiedNotification());
                    }
                    
                    Notification::make()
                        ->title('Documents validés')
                        ->body('L\'intervenant a été notifié par email.')
                        ->success()
                        ->send();
                }),
            Action::make('reject')
                ->label('Rejeter')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->visible(fn () => in_array($this->record->verification_status, ['pending', 'submitted']))
                ->form([
                    Forms\Components\Textarea::make('rejection_reason')
                        ->label('Raison du rejet')
                        ->required()
                        ->placeholder('Expliquez pourquoi les documents sont rejetés...'),
                ])
                ->action(function (array $data) {
                    $this->record->update([
                        'verification_status' => 'rejected',
                        'rejection_reason' => $data['rejection_reason'],
                    ]);
                    
                    if ($this->record->user) {
                        $this->record->user->notify(new DocumentsRejectedNotification($data['rejection_reason']));
                    }
                    
                    Notification::make()
                        ->title('Documents rejetés')
                        ->body('L\'intervenant a été notifié par email.')
                        ->warning()
                        ->send();
                }),
        ];
    }

    public function getDocuments(): array
    {
        $documents = [];
        
        $documentTypes = [
            'id_document' => [
                'label' => 'Pièce d\'identité',
                'icon' => 'heroicon-o-identification',
                'required' => true,
            ],
            'address_proof' => [
                'label' => 'Justificatif de domicile',
                'icon' => 'heroicon-o-home',
                'required' => true,
            ],
            'siret_document' => [
                'label' => 'Document SIRET',
                'icon' => 'heroicon-o-document-text',
                'required' => true,
            ],
            'driving_license_document' => [
                'label' => 'Permis de conduire',
                'icon' => 'heroicon-o-truck',
                'required' => false,
            ],
            'insurance_document' => [
                'label' => 'Attestation d\'assurance',
                'icon' => 'heroicon-o-shield-check',
                'required' => false,
            ],
        ];

        foreach ($documentTypes as $field => $config) {
            $path = $this->record->$field;
            $documents[] = [
                'type' => $field,
                'label' => $config['label'],
                'icon' => $config['icon'],
                'required' => $config['required'],
                'uploaded' => !empty($path),
                'path' => $path,
                'url' => $path ? Storage::disk('public')->url($path) : null,
                'is_image' => $path ? $this->isImage($path) : false,
            ];
        }

        return $documents;
    }

    private function isImage(string $path): bool
    {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        return in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp']);
    }
}
