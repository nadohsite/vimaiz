import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Camera, MapPin, User } from 'lucide-react';
import { getAvatarUrl } from '@/lib/utils';

import AddressAutocomplete from '@/components/address/AddressAutocomplete';
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

interface ReferenceAddress {
    street_address: string;
    city: string;
    postal_code: string | null;
    latitude: number | null;
    longitude: number | null;
}

export default function Profile({
    mustVerifyEmail,
    status,
    referenceAddress = null,
    extendedRadiusKm = 150,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    referenceAddress?: ReferenceAddress | null;
    extendedRadiusKm?: number;
}) {
    const { auth } = usePage<SharedData>().props;
    const isAgent = auth.user.role === 'agent';
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name || '',
        first_name: (auth.user as any).first_name || '',
        last_name: (auth.user as any).last_name || '',
        email: auth.user.email,
        phone: (auth.user as any).phone || '',
        avatar: null as File | null,
        street_address: referenceAddress?.street_address ?? '',
        city: referenceAddress?.city ?? '',
        postal_code: referenceAddress?.postal_code ?? '',
        latitude: referenceAddress?.latitude as number | null,
        longitude: referenceAddress?.longitude as number | null,
        _method: 'PATCH',
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
        post(route('settings.profile.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const avatarUrl = avatarPreview || getAvatarUrl((auth.user as any).avatar, auth.user.name);
    const latitude = data.latitude == null || data.latitude === '' ? NaN : Number(data.latitude);
    const longitude = data.longitude == null || data.longitude === '' ? NaN : Number(data.longitude);
    const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

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
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
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
                                    className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white shadow-lg transition-colors hover:bg-primary/90"
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

                        {isAgent && (
                            <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-700">
                                <HeadingSmall
                                    title="Localisation de référence"
                                    description={`Les interventions vous sont proposées dans un rayon d’environ ${extendedRadiusKm} km.`}
                                />

                                <div className="grid gap-2">
                                    <Label htmlFor="street_address">Adresse</Label>
                                    <AddressAutocomplete
                                        initialValue={data.street_address}
                                        placeholder="Rechercher votre adresse..."
                                        onAddressSelect={(selected) => {
                                            setData({
                                                ...data,
                                                street_address: selected.address_line1,
                                                city: selected.city || data.city,
                                                postal_code: selected.postal_code || data.postal_code,
                                                latitude: selected.latitude,
                                                longitude: selected.longitude,
                                            });
                                        }}
                                    />
                                    <InputError message={errors.street_address || errors.latitude} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="city">Ville</Label>
                                        <Input
                                            id="city"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder="Ville"
                                        />
                                        <InputError message={errors.city} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="postal_code">Code postal</Label>
                                        <Input
                                            id="postal_code"
                                            value={data.postal_code ?? ''}
                                            onChange={(e) => setData('postal_code', e.target.value)}
                                            placeholder="73000"
                                        />
                                        <InputError message={errors.postal_code} />
                                    </div>
                                </div>

                                {hasCoordinates ? (
                                    <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                                        <MapPin className="h-4 w-4" />
                                        Position enregistrée ({latitude.toFixed(4)},{' '}
                                        {longitude.toFixed(4)})
                                    </p>
                                ) : (
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        Choisissez une adresse dans la liste pour recevoir des interventions près de chez vous.
                                    </p>
                                )}
                            </div>
                        )}

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
                            <Button disabled={processing}>
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
