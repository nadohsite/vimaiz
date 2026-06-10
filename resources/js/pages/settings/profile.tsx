import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Camera, User } from 'lucide-react';
import { getAvatarUrl } from '@/lib/utils';

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
        title: 'Mon compte',
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
    const { auth, flash } = usePage<SharedData & { flash?: { success?: string } }>().props;
    const isAgent = (auth.user as { role?: string }).role === 'agent';
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const { data, setData, post, errors, processing, recentlySuccessful, reset } = useForm({
        _method: 'patch',
        name: auth.user.name || '',
        first_name: (auth.user as any).first_name || '',
        last_name: (auth.user as any).last_name || '',
        email: auth.user.email,
        phone: (auth.user as any).phone || '',
        avatar: null as File | null,
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // POST + _method=patch : PHP ne parse pas le multipart (upload avatar) sur un vrai PATCH
        post(route('settings.profile.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setAvatarPreview(null);
                reset('avatar');
            },
        });
    };

    const avatarUrl = avatarPreview || getAvatarUrl((auth.user as any).avatar, auth.user.name);

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Mon compte" />

            <SettingsLayout>
                <div className="space-y-6">
                    {isAgent && (
                        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
                            <p className="text-sm text-sky-800 dark:text-sky-200">
                                Pour vos informations professionnelles (SIRET, équipements, documents), consultez votre{' '}
                                <Link href={route('agent.profile.edit')} className="font-medium underline">
                                    profil professionnel
                                </Link>
                                .
                            </p>
                        </div>
                    )}

                    {flash?.success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                            {flash.success}
                        </div>
                    )}

                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                            Veuillez corriger les erreurs du formulaire.
                        </div>
                    )}

                    <HeadingSmall
                        title="Informations du compte"
                        description="Nom, e-mail, téléphone et photo de profil"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-12 w-12 text-slate-400" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Photo de profil</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">JPG, PNG. Max 2MB</p>
                                <InputError className="mt-1" message={errors.avatar} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Nom complet"
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name">Prénom</Label>
                                <Input
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    placeholder="Prénom"
                                />
                                <InputError className="mt-2" message={errors.first_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Nom de famille</Label>
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    placeholder="Nom de famille"
                                />
                                <InputError className="mt-2" message={errors.last_name} />
                            </div>
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
                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="+33 6 00 00 00 00"
                            />
                            <InputError className="mt-2" message={errors.phone} />
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
