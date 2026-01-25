import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Head, Link } from '@inertiajs/react';
import { router as inertiaRouter } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { MapPin, Search, Heart, Star } from 'lucide-react';
import L from 'leaflet';

import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

// Fix default marker icons
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

interface Agent {
    id: number;
    name: string;
    email: string;
    profile_photo: string | null;
    description: string | null;
    experience_years: number;
    hourly_rate: number;
    average_rating: number;
    total_reviews: number;
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    distance: number | null;
    search_score: number | null;
}

interface Props {
    agents: Agent[] | { data: Agent[] }; // ⬅️ support tableau & pagination
    services: Array<{ id: number; name: string }>;
    filters: {
        lat: number | null;
        lng: number | null;
        radius: number;
        service_id: number | null;
        date: string | null;
        min_experience: number | null;
        min_rating: number | null;
        search: string | null;
        property_type: string | null;
        size: string | null;
    };
}

// Component to recenter map on agent selection
function MapRecenter({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (!isNaN(position[0]) && !isNaN(position[1])) {
            map.flyTo(position, 13, { duration: 1.2 });
        }
    }, [position, map]);
    return null;
}

export default function SearchIndex({ agents, filters, services }: Props) {
    const router = inertiaRouter;
    
    // Ensure numeric filters
    const lat = filters.lat ? Number(filters.lat) : null;
    const lng = filters.lng ? Number(filters.lng) : null;
    const radius = Number(filters.radius || 20);

    /** 🧠 Convertir agents en tableau propre */
    const agentsList: Agent[] = Array.isArray((agents as any)?.data)
        ? (agents as any).data
        : Array.isArray(agents)
        ? agents
        : [];

    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([
        33.5731, -7.5898,
    ]); // Casablanca default
    const [userLocation, setUserLocation] = useState<[number, number] | null>(
        null,
    );

    useEffect(() => {
        // Geolocation
        if (navigator.geolocation && !lat) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords: [number, number] = [
                        position.coords.latitude,
                        position.coords.longitude,
                    ];
                    setUserLocation(coords);
                    setMapCenter(coords);

                    router.get(
                        route('agents.index'),
                        {
                            ...filters,
                            lat: coords[0],
                            lng: coords[1],
                            radius: radius,
                        },
                        { preserveState: true, preserveScroll: true },
                    );
                },
                (err) => console.log('Erreur géolocalisation :', err),
            );
        } else if (lat && lng) {
            const coords: [number, number] = [lat, lng];
            setUserLocation(coords);
            setMapCenter(coords);
        }
    }, []);

    /** Liste agents avec coordonnées */
    const agentsWithCoords = agentsList.filter(
        (a) => a.latitude && a.longitude,
    );

    return (
        <div className="min-h-screen bg-neutral-50">
            <Head title="Recherche Agents - VIMAIZ" />

            {/* Header */}
            <nav className="border-b border-neutral-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link
                            href={route('home')}
                            className="flex items-center gap-2"
                        >
                            <div className="rounded-md bg-indigo-600 p-1">
                                <span className="text-sm font-bold text-white">
                                    V
                                </span>
                            </div>
                            <span className="text-xl font-bold text-neutral-900">
                                VIMAIZ
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
                {/* Filters Sidebar */}
                <div className="w-full border-r border-neutral-200 bg-white lg:w-1/4">
                    <div className="p-6">
                        <h2 className="mb-6 text-lg font-bold text-neutral-900 border-b pb-2">
                            Filtres avancés
                        </h2>

                        <div className="space-y-6">
                            {/* Service Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700">Service</label>
                                <Select 
                                    value={filters.service_id?.toString() || "all"} 
                                    onValueChange={(val) => router.get(route('agents.index'), { ...filters, service_id: val === "all" ? null : val }, { preserveState: true })}
                                >
                                    <SelectTrigger className="w-full rounded-lg border-neutral-200 text-sm h-10 bg-white">
                                        <SelectValue placeholder="Tous les services" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les services</SelectItem>
                                        {services?.map((s: any) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Experience Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700">Expérience min. (années)</label>
                                <input
                                    type="number"
                                    value={filters.min_experience || ''}
                                    placeholder="Ex: 2"
                                    onChange={(e) => router.get(route('agents.index'), { ...filters, min_experience: e.target.value }, { preserveState: true })}
                                    className="w-full rounded-lg border-neutral-200 text-sm"
                                />
                            </div>

                            {/* Availability (Date) Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700">Disponibilité (Date)</label>
                                <input
                                    type="date"
                                    value={filters.date || ''}
                                    onChange={(e) => router.get(route('agents.index'), { ...filters, date: e.target.value }, { preserveState: true })}
                                    className="w-full rounded-lg border-neutral-200 text-sm"
                                />
                            </div>

                            {/* Rating Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700">Note minimale</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => router.get(route('agents.index'), { ...filters, min_rating: star }, { preserveState: true })}
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${filters.min_rating === star ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-neutral-400 border-neutral-200'}`}
                                        >
                                            {star}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Property Type Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700">Type de logement</label>
                                <Select 
                                    value={filters.property_type || "all"} 
                                    onValueChange={(val) => router.get(route('agents.index'), { ...filters, property_type: val === "all" ? null : val }, { preserveState: true })}
                                >
                                    <SelectTrigger className="w-full rounded-lg border-neutral-200 text-sm h-10 bg-white">
                                        <SelectValue placeholder="Tous les types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les types</SelectItem>
                                        <SelectItem value="appartement">Appartement</SelectItem>
                                        <SelectItem value="maison">Maison</SelectItem>
                                        <SelectItem value="villa">Villa</SelectItem>
                                        <SelectItem value="bureau">Bureau</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Surface Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700">Surface (m²)</label>
                                <Select 
                                    value={filters.size || "all"} 
                                    onValueChange={(val) => router.get(route('agents.index'), { ...filters, size: val === "all" ? null : val }, { preserveState: true })}
                                >
                                    <SelectTrigger className="w-full rounded-lg border-neutral-200 text-sm h-10 bg-white">
                                        <SelectValue placeholder="Toutes surfaces" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes surfaces</SelectItem>
                                        <SelectItem value="small">Moins de 50 m²</SelectItem>
                                        <SelectItem value="medium">50 - 100 m²</SelectItem>
                                        <SelectItem value="large">100 - 200 m²</SelectItem>
                                        <SelectItem value="extra">Plus de 200 m²</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Radius Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700">Rayon ({radius} km)</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={radius}
                                    onChange={(e) => router.get(route('agents.index'), { ...filters, radius: e.target.value }, { preserveState: true })}
                                    className="w-full accent-indigo-600"
                                />
                            </div>

                            <button
                                onClick={() => router.get(route('agents.index'), {})}
                                className="w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>

                {/* Agents List */}
                <div className="w-full overflow-y-auto border-r border-neutral-200 bg-white lg:w-1/3">
                    <div className="p-6">
                        <h1 className="mb-2 text-2xl font-bold text-neutral-900">
                            {agentsList.length} Agents disponibles
                        </h1>
                        <p className="mb-6 text-sm text-neutral-500">
                            {lat && lng
                                ? `À moins de ${radius} km de votre position`
                                : 'Résultats pour votre recherche'}
                        </p>

                        <div className="space-y-4">
                            {agentsList.map((agent) => (
                                <motion.div
                                    key={agent.id}
                                    onClick={() => {
                                        setSelectedAgent(agent);
                                        if (agent.latitude && agent.longitude)
                                            setMapCenter([
                                                agent.latitude,
                                                agent.longitude,
                                            ]);
                                    }}
                                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                                        selectedAgent?.id === agent.id
                                            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                            : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md'
                                    }`}
                                    whileHover={{ y: -2 }}
                                >
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-20 w-20 overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-200">
                                                {agent.profile_photo ? (
                                                    <img
                                                        src={
                                                            agent.profile_photo
                                                        }
                                                        alt={agent.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-neutral-300">
                                                        {agent.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-start justify-between">
                                                <h3 className="truncate font-bold text-neutral-900">
                                                    {agent.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="flex items-center gap-1 text-yellow-400">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    <span className="text-xs font-bold text-neutral-900">{agent.average_rating}</span>
                                                </div>
                                                <span className="text-xs text-neutral-400">({agent.total_reviews} avis)</span>
                                            </div>
                                            <p className="mb-3 text-sm font-medium text-indigo-600">
                                                {agent.hourly_rate} €<span className="text-[10px] text-neutral-400">/h</span>
                                            </p>
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-700 border border-indigo-100">
                                                    {agent.experience_years} ans exp.
                                                </span>
                                                {agent.distance && (
                                                    <span className="rounded-md bg-neutral-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neutral-500 border border-neutral-100">
                                                        {agent.distance.toFixed(1)} km
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('agents.show', agent.id)}
                                                    className="flex-1 rounded-xl bg-neutral-900 px-3 py-2.5 text-center text-xs font-bold text-white transition-all hover:bg-black active:scale-95 shadow-sm"
                                                >
                                                    Réserver
                                                </Link>
                                                <button 
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-500 transition-colors"
                                                >
                                                    <Heart className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {agentsList.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-sm text-neutral-500">Aucun agent ne correspond à vos critères.</p>
                                    <button
                                        onClick={() => router.get(route('agents.index'), {})}
                                        className="mt-4 text-sm font-bold text-indigo-600"
                                    >
                                        Effacer les filtres
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="hidden h-full w-full bg-neutral-100 lg:block lg:flex-1">
                    <MapContainer
                        center={mapCenter}
                        zoom={13}
                        className="h-full w-full"
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />

                        <MapRecenter position={mapCenter} />

                        {userLocation && (
                            <Marker position={userLocation}>
                                <Popup>Votre position</Popup>
                            </Marker>
                        )}

                        {agentsWithCoords.map((agent) => (
                            <Marker
                                key={agent.id}
                                position={[agent.latitude!, agent.longitude!]}
                            >
                                <Popup>
                                    <div className="min-w-[200px]">
                                        <div className="mb-2 flex items-center gap-3">
                                            <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-200">
                                                {agent.profile_photo ? (
                                                    <img
                                                        src={
                                                            agent.profile_photo
                                                        }
                                                        alt={agent.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center font-bold text-neutral-500">
                                                        {agent.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-neutral-900">
                                                    {agent.name}
                                                </h3>
                                                <p className="text-sm font-medium text-indigo-600">
                                                    {agent.hourly_rate} €/h
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href={route(
                                                'agents.show',
                                                agent.id,
                                            )}
                                            className="block w-full rounded bg-indigo-600 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-indigo-700"
                                        >
                                            Voir Profil
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}
