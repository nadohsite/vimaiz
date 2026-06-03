import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Home, MapPin, Maximize, Key, Wifi, Trash2 } from 'lucide-react';

export interface PropertyPreview {
    id: number;
    name: string | null;
    type_label: string;
    address_line1: string;
    address_line2: string | null;
    postal_code: string;
    city: string;
    surface_area: number;
    bedrooms: number;
    bathrooms: number;
    toilets: number;
    other_rooms: number;
    floors: number;
    external_surface: number | null;
    access_code: string | null;
    entry_instructions: string | null;
    wifi_code: string | null;
    trash_instructions: string | null;
    additional_info: string | null;
}

interface PropertyPreviewModalProps {
    property: PropertyPreview;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
    if (value === null || value === undefined || value === '' || value === 0) {
        return null;
    }

    return (
        <p className="text-sm">
            <span className="text-slate-500">{label} :</span>{' '}
            <span className="text-slate-900">{value}</span>
        </p>
    );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Icon className="h-4 w-4 text-sky-500" />
                {title}
            </h3>
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                {children}
            </div>
        </section>
    );
}

export function PropertyPreviewModal({ property, open, onOpenChange }: PropertyPreviewModalProps) {
    const displayName = property.name || property.type_label;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-sky-500" />
                        {displayName}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-2">
                    <Section title="Identité" icon={MapPin}>
                        <DetailRow label="Type" value={property.type_label} />
                        <DetailRow label="Nom" value={property.name} />
                        <p className="text-sm text-slate-900">{property.address_line1}</p>
                        {property.address_line2 && (
                            <p className="text-sm text-slate-900">{property.address_line2}</p>
                        )}
                        <p className="text-sm text-slate-900">
                            {property.postal_code} {property.city}
                        </p>
                    </Section>

                    <Section title="Caractéristiques" icon={Maximize}>
                        <DetailRow label="Surface" value={`${property.surface_area} m²`} />
                        <DetailRow label="Chambres" value={property.bedrooms} />
                        <DetailRow label="Salles de bain" value={property.bathrooms} />
                        <DetailRow label="Toilettes" value={property.toilets} />
                        <DetailRow label="Autres pièces" value={property.other_rooms} />
                        <DetailRow label="Étages" value={property.floors} />
                        {property.external_surface != null && property.external_surface > 0 && (
                            <DetailRow label="Surface extérieure" value={`${property.external_surface} m²`} />
                        )}
                    </Section>

                    <Section title="Accès & pratique" icon={Key}>
                        {property.access_code && (
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Code d&apos;accès</p>
                                <p className="font-mono font-medium">{property.access_code}</p>
                            </div>
                        )}
                        {property.entry_instructions && (
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Instructions d&apos;entrée</p>
                                <p className="text-sm whitespace-pre-line">{property.entry_instructions}</p>
                            </div>
                        )}
                        {property.wifi_code && (
                            <div className="flex items-start gap-2">
                                <Wifi className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Wi-Fi</p>
                                    <p className="text-sm font-mono">{property.wifi_code}</p>
                                </div>
                            </div>
                        )}
                        {property.trash_instructions && (
                            <div className="flex items-start gap-2">
                                <Trash2 className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Poubelles</p>
                                    <p className="text-sm whitespace-pre-line">{property.trash_instructions}</p>
                                </div>
                            </div>
                        )}
                        {property.additional_info && (
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Informations complémentaires</p>
                                <p className="text-sm whitespace-pre-line">{property.additional_info}</p>
                            </div>
                        )}
                        {!property.access_code &&
                            !property.entry_instructions &&
                            !property.wifi_code &&
                            !property.trash_instructions &&
                            !property.additional_info && (
                                <p className="text-sm text-slate-500">Aucune information d&apos;accès renseignée.</p>
                            )}
                    </Section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
