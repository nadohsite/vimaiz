<?php

namespace App\Support;

use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Illuminate\Notifications\DatabaseNotification;

class VimaizNotificationFormatter
{
    /**
     * @return array{icon: Heroicon, color: string}
     */
    public static function iconForType(?string $type): array
    {
        return match ($type) {
            'new_quote' => ['icon' => Heroicon::OutlinedDocumentText, 'color' => 'info'],
            'quote_accepted' => ['icon' => Heroicon::OutlinedCheckCircle, 'color' => 'success'],
            'quote_refused' => ['icon' => Heroicon::OutlinedXCircle, 'color' => 'danger'],
            'payment_received' => ['icon' => Heroicon::OutlinedCreditCard, 'color' => 'success'],
            'mission_assigned' => ['icon' => Heroicon::OutlinedUser, 'color' => 'primary'],
            'agent_accepted', 'agent_accepted_mission' => ['icon' => Heroicon::OutlinedCheckBadge, 'color' => 'success'],
            'agent_refused_mission' => ['icon' => Heroicon::OutlinedXCircle, 'color' => 'danger'],
            'mission_started' => ['icon' => Heroicon::OutlinedPlay, 'color' => 'info'],
            'mission_completed' => ['icon' => Heroicon::OutlinedCheckCircle, 'color' => 'success'],
            'agent_payout' => ['icon' => Heroicon::OutlinedBanknotes, 'color' => 'warning'],
            'new_message' => ['icon' => Heroicon::OutlinedChatBubbleLeftRight, 'color' => 'info'],
            'new_cleaning_request', 'new_service_request' => ['icon' => Heroicon::OutlinedHome, 'color' => 'info'],
            'withdrawal_request' => ['icon' => Heroicon::OutlinedBanknotes, 'color' => 'warning'],
            'return_requested' => ['icon' => Heroicon::OutlinedExclamationTriangle, 'color' => 'warning'],
            'return_completed' => ['icon' => Heroicon::OutlinedArrowPath, 'color' => 'success'],
            'documents_verified' => ['icon' => Heroicon::OutlinedDocumentCheck, 'color' => 'success'],
            'documents_rejected' => ['icon' => Heroicon::OutlinedDocumentMinus, 'color' => 'danger'],
            'agent_warning' => ['icon' => Heroicon::OutlinedExclamationTriangle, 'color' => 'warning'],
            'agent_suspended' => ['icon' => Heroicon::OutlinedNoSymbol, 'color' => 'warning'],
            'agent_banned' => ['icon' => Heroicon::OutlinedShieldExclamation, 'color' => 'danger'],
            default => ['icon' => Heroicon::OutlinedBell, 'color' => 'gray'],
        };
    }

    public static function toFilament(DatabaseNotification $notification): Notification
    {
        $data = $notification->data;
        $type = $data['type'] ?? null;
        ['icon' => $icon, 'color' => $color] = self::iconForType($type);

        $filamentNotification = Notification::make($notification->getKey())
            ->title($data['message'] ?? 'Notification')
            ->icon($icon)
            ->iconColor($color)
            ->persistent();

        if (! empty($data['preview'])) {
            $filamentNotification->body($data['preview']);
        }

        if (! empty($data['url'])) {
            $filamentNotification->actions([
                Action::make('view')
                    ->label('Voir')
                    ->url($data['url'])
                    ->markAsRead(),
            ]);
        }

        return $filamentNotification;
    }
}
