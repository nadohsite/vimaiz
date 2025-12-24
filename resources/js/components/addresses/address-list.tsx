import { useState } from "react";
import { router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPin, MoreVertical, Edit2, Trash2, CheckCircle2, Home } from "lucide-react";
import AddressModal from "./address-modal";
import { Badge } from "@/components/ui/badge";

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

interface AddressListProps {
    addresses: Address[];
}

export default function AddressList({ addresses }: AddressListProps) {
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEdit = (address: Address) => {
        setSelectedAddress(address);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette adresse ?")) {
            router.delete(route('client.addresses.destroy', id));
        }
    };

    const handleSetDefault = (id: number) => {
        router.put(route('client.addresses.update', id), { is_default: true });
    };

    if (addresses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 mb-4">
                    <MapPin className="h-10 w-10 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">Aucune adresse enregistrée</h3>
                <p className="mt-2 text-sm text-neutral-500 max-w-sm mb-6">
                    Ajoutez vos lieux d'intervention (domicile, bureau...) pour faciliter vos futures réservations.
                </p>
                <AddressModal 
                    trigger={
                        <Button className="bg-black text-white hover:bg-neutral-800">
                            Ajouter une adresse
                        </Button>
                    } 
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Mes Adresses</h2>
                    <p className="text-sm text-muted-foreground">Gérez vos lieux d'intervention.</p>
                </div>
                <AddressModal 
                    trigger={
                        <Button className="bg-black text-white hover:bg-neutral-800">
                            + Ajouter
                        </Button>
                    } 
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {addresses.map((address) => (
                    <Card key={address.id} className={`relative overflow-hidden transition-all hover:shadow-md ${address.is_default ? 'border-neutral-800 ring-1 ring-neutral-800/10' : ''}`}>
                        {address.is_default && (
                            <div className="absolute top-0 right-0 rounded-bl-xl bg-black px-3 py-1 text-xs font-bold text-white shadow-sm z-10">
                                DÉFAUT
                            </div>
                        )}
                        
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${address.property_type === 'bureau' ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-600'}`}>
                                        <Home className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold text-neutral-900">
                                            {address.label || address.city}
                                        </CardTitle>
                                        <CardDescription className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                            {address.property_type || "Résidentiel"} • {address.size_sqm ? `${address.size_sqm} m²` : "Surface inconnue"}
                                        </CardDescription>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Menu</span>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleEdit(address)}>
                                            <Edit2 className="mr-2 h-4 w-4" /> Modifier
                                        </DropdownMenuItem>
                                        {!address.is_default && (
                                            <DropdownMenuItem onClick={() => handleSetDefault(address.id)}>
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Définir par défaut
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleDelete(address.id)} className="text-red-600 focus:text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="pb-3">
                            <div className="space-y-1 text-sm text-neutral-600">
                                <p className="font-medium text-neutral-900">{address.street_address}</p>
                                <p>{address.postal_code} {address.city}, {address.country}</p>
                            </div>
                            {address.instructions && (
                                <div className="mt-4 rounded-lg bg-yellow-50/50 p-2 text-xs text-yellow-800 border border-yellow-100/50">
                                    <strong>Note:</strong> {address.instructions}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <AddressModal 
                address={selectedAddress} 
                open={isEditModalOpen} 
                onOpenChange={(open) => {
                    setIsEditModalOpen(open);
                    if (!open) setSelectedAddress(null);
                }}
            />
        </div>
    );
}
