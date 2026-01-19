import { Head } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import AddressList from '@/components/addresses/address-list';

interface Address {
    id: number;
    label?: string;
    street_address: string;
    city: string;
    state?: string;
    postal_code?: string;
    country: string;
    property_type?: string;
    size_sqm?: number;
    instructions?: string;
    is_default: boolean;
}

export default function AddressesIndex({ addresses }: { addresses: Address[] }) {
    const breadcrumbs = [
        {
            title: 'Tableau de bord',
            href: route('dashboard'),
        },
        {
            title: 'Mes Adresses',
            href: route('client.addresses.index'),
        },
    ];

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Mes Adresses" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="mx-auto w-full max-w-5xl">
                    <AddressList addresses={addresses} />
                </div>
            </div>
        </AppSidebarLayout>
    );
}
