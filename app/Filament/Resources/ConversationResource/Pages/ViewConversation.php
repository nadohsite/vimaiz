<?php

namespace App\Filament\Resources\ConversationResource\Pages;

use App\Filament\Resources\ConversationResource;
use App\Models\Message;
use Filament\Actions;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewConversation extends ViewRecord
{
    protected static string $resource = ConversationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('reply')
                ->label('Répondre')
                ->icon('heroicon-o-paper-airplane')
                ->color('primary')
                ->form([
                    Textarea::make('message')
                        ->label('Message')
                        ->required()
                        ->rows(4),
                ])
                ->action(function (array $data) {
                    Message::create([
                        'conversation_id' => $this->record->id,
                        'sender_id' => auth()->id(),
                        'message' => $data['message'],
                    ]);

                    Notification::make()
                        ->title('Message envoyé')
                        ->success()
                        ->send();

                    $this->redirect(ConversationResource::getUrl('view', ['record' => $this->record]));
                }),
            Actions\EditAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
