import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import InputError from "@/components/input-error";
import { Spinner } from "@/components/ui/spinner";
import { MapPin, Plus } from "lucide-react";

interface Address {
    id?: number;
    label?: string;
    street_address: string;
    city: string;
    state?: string;
    postal_code?: string;
    country: string;
    property_type?: string;
    size_sqm?: number;
    instructions?: string;
    is_default?: boolean;
}

interface AddressModalProps {
    address?: Address | null;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function AddressModal({ address, trigger, open, onOpenChange }: AddressModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Controlled open state if provided by parent, otherwise local
    const isModalOpen = open !== undefined ? open : isOpen;
    const handleOpenChange = (val: boolean) => {
        if (onOpenChange) onOpenChange(val);
        else setIsOpen(val);
    };

    const isEditing = !!address;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        label: address?.label || "",
        street_address: address?.street_address || "",
        city: address?.city || "",
        state: address?.state || "",
        postal_code: address?.postal_code || "",
        country: address?.country || "Maroc",
        property_type: address?.property_type || "appartement",
        size_sqm: address?.size_sqm || "",
        instructions: address?.instructions || "",
        is_default: address?.is_default || false,
    });

    useEffect(() => {
        if (isModalOpen) {
            if (address) {
                setData({
                    label: address.label || "",
                    street_address: address.street_address || "",
                    city: address.city || "",
                    state: address.state || "",
                    postal_code: address.postal_code || "",
                    country: address.country || "Maroc",
                    property_type: address.property_type || "appartement",
                    size_sqm: address.size_sqm || "",
                    instructions: address.instructions || "",
                    is_default: address.is_default || false,
                });
            } else {
                reset();
                setData("country", "Maroc");
            }
            clearErrors();
        }
    }, [isModalOpen, address]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => {
                handleOpenChange(false);
                reset();
            },
            preserveScroll: true,
        };

        if (isEditing && address?.id) {
            // @ts-ignore - Inertia put types might need alias fix or strict route checking
            put(route('client.addresses.update', address.id), options);
        } else {
            post(route('client.addresses.store'), options);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Modifier l'adresse" : "Ajouter une nouvelle adresse"}</DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? "Modifiez les détails de votre lieu d'intervention ci-dessous." 
                            : "Renseignez les détails du lieu où la prestation sera effectuée."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="label">Nom du lieu (ex: Maison, Bureau)</Label>
                            <Input
                                id="label"
                                value={data.label}
                                onChange={(e) => setData("label", e.target.value)}
                                placeholder="Mon domicile"
                            />
                            <InputError message={errors.label} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="property_type">Type de bien</Label>
                            <Select 
                                value={data.property_type} 
                                onValueChange={(val) => setData("property_type", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="appartement">Appartement</SelectItem>
                                    <SelectItem value="maison">Maison</SelectItem>
                                    <SelectItem value="villa">Villa</SelectItem>
                                    <SelectItem value="bureau">Bureau</SelectItem>
                                    <SelectItem value="autre">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.property_type} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="street_address">Adresse exacte</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="street_address"
                                className="pl-9"
                                value={data.street_address}
                                onChange={(e) => setData("street_address", e.target.value)}
                                placeholder="123 Boulevard Mohammed V"
                                required
                            />
                        </div>
                        <InputError message={errors.street_address} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">Ville</Label>
                            <Input
                                id="city"
                                value={data.city}
                                onChange={(e) => setData("city", e.target.value)}
                                required
                            />
                            <InputError message={errors.city} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postal_code">Code Postal</Label>
                            <Input
                                id="postal_code"
                                value={data.postal_code}
                                onChange={(e) => setData("postal_code", e.target.value)}
                            />
                            <InputError message={errors.postal_code} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="size_sqm">Surface approximative (m²)</Label>
                            <Input
                                id="size_sqm"
                                type="number"
                                min="0"
                                value={data.size_sqm}
                                onChange={(e) => setData("size_sqm", e.target.value)}
                                placeholder="Ex: 120"
                            />
                            <InputError message={errors.size_sqm} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Pays</Label>
                            <Input
                                id="country"
                                value={data.country}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instructions">Instructions d'accès (Digicode, étage...)</Label>
                        <Textarea
                            id="instructions"
                            value={data.instructions}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData("instructions", e.target.value)}
                            placeholder="Entrée B, 3ème étage, code 1234..."
                            className="resize-none"
                        />
                        <InputError message={errors.instructions} />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox 
                            id="is_default" 
                            checked={data.is_default}
                            onCheckedChange={(checked) => setData("is_default", !!checked)}
                        />
                        <Label htmlFor="is_default" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Définir comme adresse par défaut
                        </Label>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-black text-white hover:bg-neutral-800">
                            {processing && <Spinner className="mr-2" />}
                            {isEditing ? "Enregistrer les modifications" : "Ajouter cette adresse"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
