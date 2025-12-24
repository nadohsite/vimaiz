import HeadingSmall from '@/components/heading-small';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { disable, enable } from '@/routes/two-factor';
import { type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface TwoFactorProps {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Authentification à deux facteurs',
        href: route('settings.two-factor.show'),
    },
];

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: TwoFactorProps) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Authentification à deux facteurs" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Authentification à deux facteurs"
                        description="Gérez vos paramètres de sécurité avec la double authentification"
                    />
                    {twoFactorEnabled ? (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge variant="default">Activée</Badge>
                            <p className="text-muted-foreground">
                                L'authentification à deux facteurs est activée. Vous devrez
                                saisir un code de sécurité aléatoire lors de la connexion,
                                que vous pouvez récupérer depuis l'application TOTP sur votre téléphone.
                            </p>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />

                            <div className="relative inline">
                                <Form {...disable.form()}>
                                    {({ processing }) => (
                                        <Button
                                            variant="destructive"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <ShieldBan className="mr-2 h-4 w-4" /> Désactiver la 2FA
                                        </Button>
                                    )}
                                </Form>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge variant="destructive">Désactivée</Badge>
                            <p className="text-muted-foreground">
                                Lorsque vous activez l'authentification à deux facteurs, vous
                                devrez saisir un code sécurisé lors de la connexion.
                                Ce code peut être récupéré depuis une application TOTP sur votre téléphone.
                            </p>

                            <div>
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                    >
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Continuer la configuration
                                    </Button>
                                ) : (
                                    <Form
                                        {...enable.form()}
                                        onSuccess={() =>
                                            setShowSetupModal(true)
                                        }
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                Activer la 2FA
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </div>
            </SettingsLayout>
        </AppSidebarLayout>
    );
}
