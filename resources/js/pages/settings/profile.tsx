import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres du profil',
        href: route('settings.profile.edit'),
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('settings.profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Paramètres du profil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Informations du profil"
                        description="Mettez à jour votre nom et votre adresse e-mail"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nom</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Nom complet"
                            />

                            <InputError
                                className="mt-2"
                                message={errors.name}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Adresse e-mail</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Adresse e-mail"
                            />

                            <InputError
                                className="mt-2"
                                message={errors.email}
                            />
                        </div>

                        {mustVerifyEmail &&
                            auth.user.email_verified_at === null && (
                                <div>
                                    <p className="-mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                                        Votre adresse e-mail n'est pas vérifiée.{' '}
                                        <button
                                            type="button"
                                            className="text-indigo-600 underline decoration-indigo-300 underline-offset-4 transition-colors hover:text-indigo-700"
                                        >
                                            Cliquez ici pour renvoyer l'e-mail de vérification.
                                        </button>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            Un nouveau lien de vérification a été envoyé à votre adresse e-mail.
                                        </div>
                                    )}
                                </div>
                            )}

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                            >
                                Enregistrer
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Enregistré
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppSidebarLayout>
    );
}
