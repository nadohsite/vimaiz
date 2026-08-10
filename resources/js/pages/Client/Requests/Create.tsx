import { Head, useForm, Link, router } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Home, Calendar, Clock, FileText, Send } from 'lucide-react';
import { useState } from 'react';

interface Property {
    id: number;
    name: string | null;
    type: string;
    city: string;
    surface_area: number;
}

interface Props {
    properties: Property[];
    minDate: string;
    maxDate: string;
    selectedPropertyId?: string | null;
}

export default function Create({ properties, minDate, maxDate, selectedPropertyId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        property_id: selectedPropertyId ? String(selectedPropertyId) : '',
        scheduled_date: '',
        scheduled_time: '09:00',
        special_instructions: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('client.requests.store'));
    };


    const selectedProperty = properties.find(p => p.id === Number(data.property_id));

    return (
        <AppLayout breadcrumbs={[
            { title: 'Mes demandes', href: route('client.requests.index') },
            { title: 'Nouvelle intervention', href: '#' },
        ]}>
            <Head title="Nouvelle intervention" />

            <div className="py-8">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={route('client.requests.index')} className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour aux demandes
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nouvelle intervention</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Programmez votre prochaine intervention</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Property Selection */}
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <Home className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                    Bien
                                </CardTitle>
                                <CardDescription className="dark:text-slate-400">
                                    Sélectionnez le bien à nettoyer
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="property_id">Bien *</Label>
                                    <Select 
                                        value={data.property_id} 
                                        onValueChange={(value) => setData('property_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un bien..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {properties.map((property) => (
                                                <SelectItem key={property.id} value={String(property.id)}>
                                                    {property.name || property.type} - {property.city} ({property.surface_area} m²)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.property_id && <p className="text-sm text-red-500">{errors.property_id}</p>}
                                </div>

                                {properties.length === 0 && (
                                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                            Vous n'avez pas encore de bien.{' '}
                                            <Link href={route('client.properties.create')} className="font-medium underline">
                                                Ajouter un bien
                                            </Link>
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Date & Time */}
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <Calendar className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                    Date et heure d'intervention
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled_date">Date *</Label>
                                        <Input
                                            id="scheduled_date"
                                            type="date"
                                            min={minDate}
                                            max={maxDate}
                                            value={data.scheduled_date}
                                            onChange={(e) => setData('scheduled_date', e.target.value)}
                                        />
                                        {errors.scheduled_date && <p className="text-sm text-red-500">{errors.scheduled_date}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled_time">Heure de début *</Label>
                                        <Select 
                                            value={data.scheduled_time} 
                                            onValueChange={(value) => setData('scheduled_time', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.scheduled_time && <p className="text-sm text-red-500">{errors.scheduled_time}</p>}
                                    </div>
                                </div>

                            </CardContent>
                        </Card>

                        {/* Instructions */}
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="dark:text-white">Instructions particulières</CardTitle>
                                <CardDescription className="dark:text-slate-400">
                                    Précisez vos attentes pour cette intervention
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    id="special_instructions"
                                    value={data.special_instructions}
                                    onChange={(e) => setData('special_instructions', e.target.value)}
                                    placeholder="Ex: Insister sur la salle de bain, ne pas toucher au bureau..."
                                    rows={4}
                                />
                                {errors.special_instructions && <p className="text-sm text-red-500">{errors.special_instructions}</p>}
                            </CardContent>
                        </Card>

                        {/* Info devis */}
                        <Card className="bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-900/30 dark:to-cyan-900/30 border-sky-200 dark:border-sky-800">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        <strong>Devis personnalisé</strong> : Nous vous enverrons un devis détaillé sous 24h après réception de votre demande.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <div className="flex justify-end gap-4">
                            <Link href={route('client.requests.index')}>
                                <Button type="button" variant="outline" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">Annuler</Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={processing || !data.property_id} 
                                className="bg-sky-500 hover:bg-sky-600"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Envoyer la demande
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
