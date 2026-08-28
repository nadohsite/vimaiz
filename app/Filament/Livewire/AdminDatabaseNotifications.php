<?php

namespace App\Filament\Livewire;

use Filament\Actions\Action;
use Filament\Livewire\DatabaseNotifications as BaseDatabaseNotifications;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Carbon;
use Livewire\Attributes\On;

class AdminDatabaseNotifications extends BaseDatabaseNotifications
{
    public function getNotificationsQuery(): Builder|Relation
    {
        $user = $this->getUser();

        if (! $user) {
            abort(401);
        }

        return $user->notifications()->latest();
    }

    public function getNotification(DatabaseNotification $notification): Notification
    {
        $data = is_array($notification->data) ? $notification->data : [];

        if (($data['format'] ?? null) === 'filament') {
            return parent::getNotification($notification);
        }

        $type = (string) ($data['type'] ?? 'default');
        $message = (string) ($data['message'] ?? 'Nouvelle notification');
        $url = $data['url'] ?? null;
        $color = $this->colorForType($type);

        $createdAt = $notification->created_at;
        $filamentNotification = Notification::make((string) $notification->getKey())
            ->title($this->titleForType($type))
            ->body($message)
            ->icon($this->iconForType($type))
            ->iconColor($color)
            ->color($color)
            ->status($color)
            ->persistent()
            ->date($createdAt ? $this->formatNotificationDate(Carbon::parse($createdAt)) : '');

        if (filled($url)) {
            $filamentNotification->actions([
                Action::make('view')
                    ->label('Voir')
                    ->url($url)
                    ->markAsRead(),
            ]);
        }

        return $filamentNotification;
    }

    #[On('notificationClosed')]
    public function removeNotification(string $id): void
    {
        $this->getNotificationsQuery()
            ->where('id', $id)
            ->delete();
    }

    #[On('markedNotificationAsRead')]
    public function markNotificationAsRead(string $id): void
    {
        $this->getNotificationsQuery()
            ->where('id', $id)
            ->update(['read_at' => now()]);
    }

    #[On('markedNotificationAsUnread')]
    public function markNotificationAsUnread(string $id): void
    {
        $this->getNotificationsQuery()
            ->where('id', $id)
            ->update(['read_at' => null]);
    }

    public function markAllNotificationsAsReadAction(): Action
    {
        return parent::markAllNotificationsAsReadAction()
            ->label('Tout marquer comme lu');
    }

    public function clearNotificationsAction(): Action
    {
        return parent::clearNotificationsAction()
            ->label('Tout effacer');
    }

    protected function titleForType(string $type): string
    {
        return match ($type) {
            'new_service_request' => 'Nouvelle demande',
            'quote_accepted' => 'Devis accepté',
            'quote_refused' => 'Devis refusé',
            'mission_assigned' => 'Proposition d\'intervention',
            'mission_needs_agent' => 'Intervenant manquant',
            'agent_refused_mission' => 'Intervention refusée',
            'agent_accepted_mission', 'agent_accepted' => 'Intervenant confirmé',
            'mission_completed' => 'Intervention terminée',
            'return_requested' => 'Demande de retour',
            'return_completed' => 'Retour terminé',
            'withdrawal_request' => 'Demande de retrait',
            'payment_received' => 'Paiement reçu',
            default => 'Notification',
        };
    }

    protected function iconForType(string $type): Heroicon
    {
        return match ($type) {
            'new_service_request' => Heroicon::OutlinedClipboardDocumentList,
            'quote_accepted' => Heroicon::OutlinedCheckCircle,
            'quote_refused' => Heroicon::OutlinedXCircle,
            'mission_needs_agent' => Heroicon::OutlinedUserPlus,
            'mission_assigned' => Heroicon::OutlinedBriefcase,
            'agent_refused_mission' => Heroicon::OutlinedXCircle,
            'agent_accepted_mission', 'agent_accepted' => Heroicon::OutlinedCheckBadge,
            'mission_completed' => Heroicon::OutlinedBriefcase,
            'return_requested' => Heroicon::OutlinedArrowUturnLeft,
            'return_completed' => Heroicon::OutlinedCheckCircle,
            'withdrawal_request' => Heroicon::OutlinedBanknotes,
            'payment_received' => Heroicon::OutlinedCreditCard,
            default => Heroicon::OutlinedBell,
        };
    }

    protected function colorForType(string $type): string
    {
        return match ($type) {
            'quote_refused', 'agent_refused_mission', 'mission_needs_agent' => 'danger',
            'return_requested', 'withdrawal_request' => 'warning',
            'quote_accepted', 'mission_completed', 'payment_received', 'agent_accepted_mission', 'agent_accepted', 'return_completed' => 'success',
            default => 'info',
        };
    }
}
