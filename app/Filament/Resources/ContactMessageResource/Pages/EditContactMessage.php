<?php

namespace App\Filament\Resources\ContactMessageResource\Pages;

use App\Filament\Resources\ContactMessageResource;
use App\Mail\ContactReplyMail;
use Filament\Actions;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Mail;

class EditContactMessage extends EditRecord
{
    protected static string $resource = ContactMessageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\Action::make('reply')
                ->label('Répondre')
                ->icon('heroicon-o-paper-airplane')
                ->color('success')
                ->form([
                    TextInput::make('subject')
                        ->label('Sujet')
                        ->default(fn () => 'Re: ' . $this->record->subject)
                        ->required(),
                    Textarea::make('reply_message')
                        ->label('Message')
                        ->required()
                        ->rows(8)
                        ->placeholder('Votre réponse...'),
                ])
                ->action(function (array $data) {
                    Mail::to($this->record->email)
                        ->send(new ContactReplyMail(
                            $this->record,
                            $data['subject'],
                            $data['reply_message']
                        ));

                    $this->record->markAsReplied();

                    Notification::make()
                        ->title('Réponse envoyée')
                        ->body("Email envoyé à {$this->record->email}")
                        ->success()
                        ->send();
                }),
            Actions\Action::make('archive')
                ->label('Archiver')
                ->icon('heroicon-o-archive-box')
                ->color('gray')
                ->visible(fn () => $this->record->status !== 'archived')
                ->requiresConfirmation()
                ->action(function () {
                    $this->record->archive();
                    Notification::make()
                        ->title('Message archivé')
                        ->success()
                        ->send();
                    $this->redirect(ContactMessageResource::getUrl('index'));
                }),
            Actions\DeleteAction::make(),
        ];
    }
}
