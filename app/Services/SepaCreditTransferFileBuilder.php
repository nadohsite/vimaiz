<?php

namespace App\Services;

use App\Models\WalletTransaction;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Construit un fichier de virements groupés SEPA (norme ISO 20022,
 * pain.001.001.03) : le format standard qu'acceptent la quasi-totalité des
 * banques professionnelles françaises/européennes pour importer plusieurs
 * virements en une seule fois ("virements groupés" / "multi-virements").
 *
 * Volontairement sans Stripe Connect : le seul renseignement nécessaire
 * côté intervenant reste son IBAN, déjà collecté sur la page "Mon
 * portefeuille". Rien de plus à configurer pour lui.
 *
 * Configuration requise : renseignée depuis Admin > Paramètres (voir
 * App\Models\PlatformSetting). Reprend au besoin les valeurs de
 * config/services.php -> 'sepa' (.env) tant que la page Paramètres n'a pas
 * encore été enregistrée au moins une fois sur ce serveur.
 * C'est l'identité bancaire de VIMAIZ elle-même, pas celle des intervenants.
 */
class SepaCreditTransferFileBuilder
{
    /**
     * @param  Collection<int, WalletTransaction>  $withdrawals
     */
    public function build(Collection $withdrawals, string $batchId): string
    {
        $settings = \App\Models\PlatformSetting::current();

        $creditorName = $settings->sepa_creditor_name ?: config('services.sepa.creditor_name');
        $creditorIban = $settings->sepa_creditor_iban ?: config('services.sepa.creditor_iban');
        $creditorBic = $settings->sepa_creditor_bic ?: config('services.sepa.creditor_bic');

        if (blank($creditorName) || blank($creditorIban)) {
            throw new SepaNotConfiguredException(
                'Identité bancaire de Vimaiz manquante : renseignez-la dans Admin > Paramètres (nom du titulaire et IBAN).'
            );
        }

        $total = $withdrawals->sum(fn (WalletTransaction $t) => (float) $t->amount);
        $executionDate = now()->addWeekday()->format('Y-m-d');
        $createdAt = now()->format('Y-m-d\TH:i:s');

        $transactionsXml = $withdrawals->map(function (WalletTransaction $transaction) {
            $iban = $transaction->metadata['iban'] ?? $transaction->reference;
            $holder = $transaction->metadata['bank_account_holder'] ?? ($transaction->wallet->user->name ?? 'Intervenant Vimaiz');

            if (blank($iban)) {
                throw new SepaNotConfiguredException(
                    'La demande de retrait #'.$transaction->id.' n\'a pas d\'IBAN enregistré, elle doit être traitée séparément.'
                );
            }

            return '<CdtTrfTxInf>'
                .'<PmtId><EndToEndId>'.$this->endToEndId($transaction).'</EndToEndId></PmtId>'
                .'<Amt><InstdAmt Ccy="EUR">'.number_format((float) $transaction->amount, 2, '.', '').'</InstdAmt></Amt>'
                .'<Cdtr><Nm>'.$this->escape(Str::limit($holder, 70, '')).'</Nm></Cdtr>'
                .'<CdtrAcct><Id><IBAN>'.$this->escape($iban).'</IBAN></Id></CdtrAcct>'
                .'<RmtInf><Ustrd>'.$this->escape('Retrait Vimaiz #'.$transaction->id).'</Ustrd></RmtInf>'
                .'</CdtTrfTxInf>';
        })->implode('');

        $debtorAgentXml = filled($creditorBic)
            ? '<DbtrAgt><FinInstnId><BIC>'.$this->escape($creditorBic).'</BIC></FinInstnId></DbtrAgt>'
            : '';

        return '<?xml version="1.0" encoding="UTF-8"?>'
            .'<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
            .'<CstmrCdtTrfInitn>'
            .'<GrpHdr>'
            .'<MsgId>'.$this->escape($batchId).'</MsgId>'
            .'<CreDtTm>'.$createdAt.'</CreDtTm>'
            .'<NbOfTxs>'.$withdrawals->count().'</NbOfTxs>'
            .'<CtrlSum>'.number_format($total, 2, '.', '').'</CtrlSum>'
            .'<InitgPty><Nm>'.$this->escape($creditorName).'</Nm></InitgPty>'
            .'</GrpHdr>'
            .'<PmtInf>'
            .'<PmtInfId>'.$this->escape($batchId).'-1</PmtInfId>'
            .'<PmtMtd>TRF</PmtMtd>'
            .'<BtchBookg>true</BtchBookg>'
            .'<NbOfTxs>'.$withdrawals->count().'</NbOfTxs>'
            .'<CtrlSum>'.number_format($total, 2, '.', '').'</CtrlSum>'
            .'<PmtTpInf><SvcLvl><Cd>SEPA</Cd></SvcLvl></PmtTpInf>'
            .'<ReqdExctnDt>'.$executionDate.'</ReqdExctnDt>'
            .'<Dbtr><Nm>'.$this->escape($creditorName).'</Nm></Dbtr>'
            .'<DbtrAcct><Id><IBAN>'.$this->escape($creditorIban).'</IBAN></Id></DbtrAcct>'
            .$debtorAgentXml
            .'<ChrgBr>SLEV</ChrgBr>'
            .$transactionsXml
            .'</PmtInf>'
            .'</CstmrCdtTrfInitn>'
            .'</Document>';
    }

    /**
     * Identifiant unique de la transaction pour la banque (35 caractères
     * max, lettres/chiffres uniquement par prudence — toutes les banques
     * n'acceptent pas les mêmes caractères spéciaux).
     */
    protected function endToEndId(WalletTransaction $transaction): string
    {
        return 'VMZWDR'.$transaction->id;
    }

    protected function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    }
}
