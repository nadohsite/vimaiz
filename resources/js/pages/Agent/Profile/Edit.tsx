import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface AgentProfileData {
    siret: string | null;
    company_type: string | null;
    company_name: string | null;
    description: string | null;
    coverage_radius_km: number;
    has_own_equipment: boolean;
    has_driving_license: boolean;
    has_vehicle: boolean;
    vehicle_type: string | null;
    verification_status: string;
}

interface CompletionStep {
    key: string;
    label: string;
    complete: boolean;
    route: string;
}

interface Props {
    agentProfile: AgentProfileData;
    completionSteps: CompletionStep[];
}

const breadcrumbs = [
    { title: 'Tableau de bord', href: route('agent.dashboard') },
    { title: 'Profil professionnel', href: route('agent.profile.edit') },
];

export default function Edit({ agentProfile, completionSteps }: Props) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        siret: agentProfile.siret ?? '',
        company_type: agentProfile.company_type ?? 'auto_entrepreneur',
        company_name: agentProfile.company_name ?? '',
        description: agentProfile.description ?? '',
        coverage_radius_km: agentProfile.coverage_radius_km ?? 20,
        has_own_equipment: agentProfile.has_own_equipment,
        has_driving_license: agentProfile.has_driving_license,
        has_vehicle: agentProfile.has_vehicle,
        vehicle_type: agentProfile.vehicle_type ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('agent.profile.update'), { preserveScroll: true });
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil professionnel" />

            <div className="max-w-3xl space-y-6 py-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profil professionnel</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Complétez vos informations pour être éligible aux missions VIMAIZ.
                    </p>
                </div>

                {(flash?.success || flash?.error) && (
                    <div className={`rounded-lg border p-4 ${flash?.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>
                        {flash?.error || flash?.success}
                    </div>
                )}

                <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Compte utilisateur</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Modifiez votre nom, e-mail, téléphone, mot de passe ou supprimez votre compte.
                            </p>
                        </div>
                        <Link href={route('settings.profile.edit')}>
                            <Button variant="outline" size="sm">Gérer mon compte</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="dark:text-white">Progression du profil</CardTitle>
                        <CardDescription>Vérifiez les étapes restantes avant de recevoir des missions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {completionSteps.map((step) => (
                            <Link
                                key={step.key}
                                href={route(step.route)}
                                className="flex items-center gap-3 rounded-lg border p-3 transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
                            >
                                {step.complete ? (
                                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <Circle className="h-5 w-5 text-slate-400" />
                                )}
                                <span className={`flex-1 text-sm ${step.complete ? 'text-slate-600 dark:text-slate-300' : 'font-medium text-slate-900 dark:text-white'}`}>
                                    {step.label}
                                </span>
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="dark:text-white">Informations professionnelles</CardTitle>
                        <CardDescription>Ces champs sont requis pour valider votre éligibilité.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="siret">Numéro SIRET *</Label>
                                    <Input
                                        id="siret"
                                        value={data.siret}
                                        onChange={(e) => setData('siret', e.target.value.replace(/\D/g, '').slice(0, 14))}
                                        placeholder="14 chiffres"
                                        maxLength={14}
                                    />
                                    <InputError message={errors.siret} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Statut juridique *</Label>
                                    <Select
                                        value={data.company_type}
                                        onValueChange={(value) => setData('company_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisir" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto_entrepreneur">Auto-entrepreneur</SelectItem>
                                            <SelectItem value="societe">Société</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.company_type} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_name">
                                        Nom de l'entreprise {data.company_type === 'societe' ? '*' : ''}
                                    </Label>
                                    <Input
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        placeholder="Raison sociale"
                                    />
                                    <InputError message={errors.company_name} />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="coverage_radius_km">Rayon d'intervention (km) *</Label>
                                    <Input
                                        id="coverage_radius_km"
                                        type="number"
                                        min={5}
                                        max={50}
                                        value={data.coverage_radius_km}
                                        onChange={(e) => setData('coverage_radius_km', Number(e.target.value))}
                                    />
                                    <InputError message={errors.coverage_radius_km} />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="description">Présentation</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Décrivez votre expérience et vos spécialités"
                                        rows={4}
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </div>

                            <div className="space-y-4 rounded-lg border p-4 dark:border-slate-600">
                                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <p>Ces équipements sont obligatoires pour intervenir chez les clients VIMAIZ.</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="has_own_equipment"
                                        checked={data.has_own_equipment}
                                        onCheckedChange={(checked) => setData('has_own_equipment', checked === true)}
                                    />
                                    <Label htmlFor="has_own_equipment" className="cursor-pointer">
                                        Je dispose de mon propre matériel de ménage
                                    </Label>
                                </div>
                                <InputError message={errors.has_own_equipment} />

                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="has_driving_license"
                                        checked={data.has_driving_license}
                                        onCheckedChange={(checked) => setData('has_driving_license', checked === true)}
                                    />
                                    <Label htmlFor="has_driving_license" className="cursor-pointer">
                                        Je possède un permis de conduire valide
                                    </Label>
                                </div>
                                <InputError message={errors.has_driving_license} />

                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="has_vehicle"
                                        checked={data.has_vehicle}
                                        onCheckedChange={(checked) => setData('has_vehicle', checked === true)}
                                    />
                                    <Label htmlFor="has_vehicle" className="cursor-pointer">
                                        Je dispose d'un véhicule pour me déplacer
                                    </Label>
                                </div>
                                <InputError message={errors.has_vehicle} />

                                {data.has_vehicle && (
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicle_type">Type de véhicule *</Label>
                                        <Input
                                            id="vehicle_type"
                                            value={data.vehicle_type}
                                            onChange={(e) => setData('vehicle_type', e.target.value)}
                                            placeholder="Ex : Utilitaire, Berline..."
                                        />
                                        <InputError message={errors.vehicle_type} />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    Enregistrer le profil
                                </Button>
                                {recentlySuccessful && (
                                    <span className="text-sm text-emerald-600">Profil enregistré</span>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
