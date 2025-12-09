import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
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
}

interface Props {
    agents: Agent[] | { data: Agent[] }; // ⬅️ support tableau & pagination
    filters: {
        lat: number | null;
        lng: number | null;
        radius: number;
        service_id: number | null;
        date: string | null;
    };
}

// Component to recenter map on agent selection
function MapRecenter({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(position, 13, { duration: 1.2 });
    }, [position, map]);
    return null;
}

export default function SearchIndex({ agents, filters }: Props) {
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
        if (navigator.geolocation && !filters.lat) {
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
                            lat: coords[0],
                            lng: coords[1],
                            radius: filters.radius,
                        },
                        { preserveState: true, preserveScroll: true },
                    );
                },
                (err) => console.log('Erreur géolocalisation :', err),
            );
        } else if (filters.lat && filters.lng) {
            const coords: [number, number] = [filters.lat, filters.lng];
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
                {/* Agents List */}
                <div className="w-full overflow-y-auto border-r border-neutral-200 bg-white lg:w-2/5">
                    <div className="p-6">
                        <h1 className="mb-2 text-2xl font-bold text-neutral-900">
                            {agentsList.length} Agents disponibles
                        </h1>
                        <p className="mb-6 text-neutral-500">
                            {filters.lat && filters.lng
                                ? `À moins de ${filters.radius} km de votre position`
                                : 'Tous les agents vérifiés'}
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
                                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                                        selectedAgent?.id === agent.id
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-16 w-16 overflow-hidden rounded-full bg-neutral-200">
                                                {agent.profile_photo ? (
                                                    <img
                                                        src={
                                                            agent.profile_photo
                                                        }
                                                        alt={agent.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-neutral-500">
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
                                                {agent.distance && (
                                                    <span className="ml-2 flex-shrink-0 text-xs text-neutral-500">
                                                        {agent.distance.toFixed(
                                                            1,
                                                        )}{' '}
                                                        km
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mb-2 text-sm font-medium text-indigo-600">
                                                {agent.hourly_rate}€/h
                                            </p>
                                            <Link
                                                href={route(
                                                    'agents.show',
                                                    agent.id,
                                                )}
                                                className="block rounded bg-indigo-600 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-indigo-700"
                                            >
                                                Voir Profil
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="hidden h-full w-full bg-neutral-100 lg:block lg:w-3/5">
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
                                                    {agent.hourly_rate}€/h
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
