<?php

namespace App\Filament\Resources\ConversationResource\Pages;

use App\Filament\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Filament\Actions;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListConversations extends ListRecords
{
    protected static string $resource = ConversationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('newDiscussion')
                ->label('Nouvelle discussion')
                ->icon('heroicon-o-chat-bubble-left-right')
                ->color('primary')
                ->form([
                    Select::make('recipient_id')
                        ->label('Interlocuteur')
                        ->helperText('Choisissez un client ou un intervenant pour démarrer une discussion.')
                        ->options(function () {
                            return User::query()
                                ->whereIn('role', ['client', 'agent'])
                                ->orderBy('role')
                                ->orderBy('name')
                                ->get()
                                ->mapWithKeys(fn (User $user) => [
                                    $user->id => ($user->role === 'client' ? 'Client — ' : 'Intervenant — ')
                                        .($user->name ?: $user->email),
                                ]);
                        })
                        ->searchable()
                        ->required(),
                    Textarea::make('message')
                        ->label('Message')
                        ->required()
                        ->rows(4),
                ])
                ->action(function (array $data) {
                    $admin = auth()->user();
                    $recipient = User::findOrFail($data['recipient_id']);

                    if ($recipient->role === 'client') {
                        $clientId = $recipient->id;
                        $agentId = $admin->id;
                    } else {
                        $clientId = $admin->id;
                        $agentId = $recipient->id;
                    }

                    $conversation = Conversation::firstOrCreate([
                        'client_id' => $clientId,
                        'agent_id' => $agentId,
                    ]);

                    Message::create([
                        'conversation_id' => $conversation->id,
                        'sender_id' => $admin->id,
                        'message' => $data['message'],
                    ]);

                    Notification::make()
                        ->title('Discussion démarrée')
                        ->success()
                        ->send();

                    $this->redirect(ConversationResource::getUrl('view', ['record' => $conversation]));
                }),
            Actions\CreateAction::make()
                ->label('Lier un client à un intervenant'),
        ];
    }
}
