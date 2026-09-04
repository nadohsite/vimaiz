<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WithdrawalRequestResource\Pages;
use App\Models\AgentProfile;
use App\Models\WalletTransaction;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Actions\Action;
use Filament\Schemas\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Notifications\Notification;
use UnitEnum;

class WithdrawalRequestResource extends Resource
{
    protected static ?string $model = WalletTransaction::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-arrow-up-tray';

    protected static string|UnitEnum|null $navigationGroup = 'Finances';

    protected static ?string $navigationLabel = 'Demandes de retrait';

    protected static ?string $modelLabel = 'Demande de retrait';

    protected static ?string $pluralModelLabel = 'Demandes de retrait';

    protected static ?int $navigationSort = 1;

    public static function getEloquentQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return parent::getEloquentQuery()
            ->where('type', 'withdrawal')
            ->with(['wallet.user']);
    }

    protected static function paymentMethod(WalletTransaction $record): string
    {
        return $record->metadata['payment_method'] ?? AgentProfile::PAYOUT_BANK_TRANSFER;
    }

    protected static function isMobileMoney(WalletTransaction $record): bool
    {
        return static::paymentMethod($record) === AgentProfile::PAYOUT_MOBILE_MONEY;
    }

    protected static function paymentMethodLabel(WalletTransaction $record): string
    {
        return static::isMobileMoney($record) ? 'Mobile Money' : 'Virement bancaire';
    }

    protected static function approveModalDescription(WalletTransaction $record): string
    {
        return static::isMobileMoney($record)
            ? 'Confirmez-vous avoir effectué le transfert Mobile Money à cet intervenant ?'
            : 'Confirmez-vous avoir effectué le virement bancaire à cet intervenant ?';
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Informations de la demande')
                    ->schema([
                        TextEntry::make('wallet.user.name')
                            ->label('Intervenant'),
                        TextEntry::make('wallet.user.email')
                            ->label('Email'),
                        TextEntry::make('amount')
                            ->label('Montant')
                            ->money('EUR'),
                        TextEntry::make('payment_method_label')
                            ->label('Mode de paiement')
                            ->state(fn (WalletTransaction $record): string => static::paymentMethodLabel($record))
                            ->badge()
                            ->color(fn (WalletTransaction $record): string => static::isMobileMoney($record) ? 'info' : 'primary'),
                        TextEntry::make('metadata.bank_account_holder')
                            ->label('Titulaire')
                            ->state(fn (WalletTransaction $record): ?string => static::isMobileMoney($record)
                                ? ($record->metadata['account_name'] ?? null)
                                : ($record->metadata['bank_account_holder'] ?? null))
                            ->placeholder('Non renseigné'),
                        TextEntry::make('reference')
                            ->label(fn (WalletTransaction $record): string => static::isMobileMoney($record) ? 'Numéro Mobile Money' : 'IBAN')
                            ->formatStateUsing(function (?string $state, WalletTransaction $record): string {
                                if (static::isMobileMoney($record)) {
                                    return $state ?: ($record->metadata['phone'] ?? 'Non renseigné');
                                }

                                return AgentProfile::formatIban($state) ?? ($state ?: 'Non renseigné');
                            }),
                        TextEntry::make('metadata.provider_label')
                            ->label('Fournisseur')
                            ->visible(fn (WalletTransaction $record): bool => static::isMobileMoney($record))
                            ->placeholder('Non renseigné'),
                        TextEntry::make('metadata.bic')
                            ->label('BIC')
                            ->visible(fn (WalletTransaction $record): bool => ! static::isMobileMoney($record))
                            ->placeholder('Non renseigné'),
                        TextEntry::make('status')
                            ->label('Statut')
                            ->badge()
                            ->formatStateUsing(fn ($state) => match ($state) {
                                'pending' => 'En attente',
                                'completed' => 'Validé',
                                'rejected' => 'Rejeté',
                                default => $state,
                            })
                            ->color(fn ($state) => match ($state) {
                                'pending' => 'warning',
                                'completed' => 'success',
                                'rejected' => 'danger',
                                default => 'gray',
                            }),
                        TextEntry::make('created_at')
                            ->label('Date de demande')
                            ->dateTime('d/m/Y H:i'),
                    ])->columns(3),
                Section::make('Solde du portefeuille')
                    ->schema([
                        TextEntry::make('wallet.balance')
                            ->label('Solde actuel')
                            ->money('EUR'),
                        TextEntry::make('wallet.total_earned')
                            ->label('Total gagné')
                            ->money('EUR'),
                        TextEntry::make('wallet.total_withdrawn')
                            ->label('Total retiré')
                            ->money('EUR'),
                    ])->columns(3),
            ]);
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('wallet.user.name')
                    ->label('Intervenant')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Montant')
                    ->money('EUR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('payment_method')
                    ->label('Mode')
                    ->state(fn (WalletTransaction $record): string => static::paymentMethodLabel($record))
                    ->badge()
                    ->color(fn (WalletTransaction $record): string => static::isMobileMoney($record) ? 'info' : 'primary'),
                Tables\Columns\TextColumn::make('destination')
                    ->label('Destination')
                    ->state(function (WalletTransaction $record): string {
                        if (static::isMobileMoney($record)) {
                            $provider = $record->metadata['provider_label'] ?? 'Mobile Money';
                            $phone = $record->metadata['phone'] ?? $record->reference;

                            return trim($provider.' — '.$phone);
                        }

                        $holder = $record->metadata['bank_account_holder'] ?? '';
                        $iban = AgentProfile::formatIban($record->reference) ?? $record->reference;

                        return trim($holder.' — '.$iban, ' —');
                    })
                    ->limit(40)
                    ->toggleable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'pending' => 'En attente',
                        'completed' => 'Validé',
                        'rejected' => 'Rejeté',
                        default => $state,
                    })
                    ->color(fn ($state) => match ($state) {
                        'pending' => 'warning',
                        'completed' => 'success',
                        'rejected' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Date')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'pending' => 'En attente',
                        'completed' => 'Validé',
                        'rejected' => 'Rejeté',
                    ]),
            ])
            ->actions([
                Action::make('view')
                    ->label('Voir')
                    ->icon('heroicon-o-eye')
                    ->url(fn ($record) => static::getUrl('view', ['record' => $record])),
                Action::make('approve')
                    ->label('Valider')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Valider le retrait')
                    ->modalDescription(fn ($record) => static::approveModalDescription($record))
                    ->modalSubmitActionLabel('Oui, valider')
                    ->visible(fn ($record) => $record->status === 'pending')
                    ->action(function ($record) {
                        $record->update([
                            'status' => 'completed',
                            'metadata' => array_merge($record->metadata ?? [], [
                                'approved_at' => now()->toISOString(),
                                'approved_by' => auth()->id(),
                            ]),
                        ]);

                        Notification::make()
                            ->title('Retrait validé')
                            ->success()
                            ->send();
                    }),
                Action::make('reject')
                    ->label('Rejeter')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Rejeter le retrait')
                    ->modalDescription('Le montant sera remboursé au portefeuille de l\'intervenant.')
                    ->modalSubmitActionLabel('Rejeter et rembourser')
                    ->visible(fn ($record) => $record->status === 'pending')
                    ->action(function ($record) {
                        $wallet = $record->wallet;
                        $wallet->balance += $record->amount;
                        $wallet->total_withdrawn -= $record->amount;
                        $wallet->save();

                        $record->update([
                            'status' => 'rejected',
                            'metadata' => array_merge($record->metadata ?? [], [
                                'rejected_at' => now()->toISOString(),
                                'rejected_by' => auth()->id(),
                            ]),
                        ]);

                        Notification::make()
                            ->title('Retrait rejeté et remboursé')
                            ->warning()
                            ->send();
                    }),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWithdrawalRequests::route('/'),
            'view' => Pages\ViewWithdrawalRequest::route('/{record}'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getNavigationBadge(): ?string
    {
        $count = static::getEloquentQuery()->where('status', 'pending')->count();
        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }
}
