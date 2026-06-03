import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PropertyMapProps {
    latitude: number | null;
    longitude: number | null;
    address: string;
    propertyName?: string;
}

declare global {
    interface Window {
        L: typeof import('leaflet');
    }
}

export default function PropertyMap({ latitude, longitude, address, propertyName }: PropertyMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const hasCoordinates = latitude !== null && longitude !== null && latitude !== 0 && longitude !== 0;

    useEffect(() => {
        if (!hasCoordinates || !mapRef.current) return;

        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        // Load Leaflet JS
        if (!window.L) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => initMap();
            document.head.appendChild(script);
        } else {
            initMap();
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [latitude, longitude]);

    const initMap = () => {
        if (!mapRef.current || !window.L || !hasCoordinates) return;

        // Create map
        const map = window.L.map(mapRef.current).setView([latitude!, longitude!], 15);
        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Custom marker icon
        const customIcon = window.L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: #0ea5e9; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        // Add marker
        window.L.marker([latitude!, longitude!], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<strong>${propertyName || 'Logement'}</strong><br>${address}`)
            .openPopup();

        setMapLoaded(true);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                () => {},
            );
        }
    };

    const openGoogleMaps = () => {
        if (!hasCoordinates) return;
        const url = userLocation
            ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${latitude},${longitude}`
            : `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        window.open(url, '_blank');
    };

    const openWaze = () => {
        if (!hasCoordinates) return;
        const url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
        window.open(url, '_blank');
    };

    const openAppleMaps = () => {
        if (!hasCoordinates) return;
        const url = `https://maps.apple.com/?daddr=${latitude},${longitude}`;
        window.open(url, '_blank');
    };

    if (!hasCoordinates) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4 text-sky-500" />
                        Localisation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-100 rounded-lg p-4 text-center">
                        <MapPin className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Coordonnées non disponibles</p>
                        <p className="text-sm font-medium mt-2">{address}</p>
                    </div>
                    <div className="mt-4 space-y-2">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Rechercher sur Google Maps
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-sky-500" />
                    Localisation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
                <div 
                    ref={mapRef} 
                    className="h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
                    style={{ minHeight: '256px' }}
                >
                    {!mapLoaded && (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin h-6 w-6 border-2 border-sky-500 border-t-transparent rounded-full"></div>
                        </div>
                    )}
                </div>

                <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={openGoogleMaps}
                            className="text-xs"
                        >
                            <Navigation className="h-3 w-3 mr-1" />
                            Google Maps
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={openWaze}
                            className="text-xs"
                        >
                            <Navigation className="h-3 w-3 mr-1" />
                            Waze
                        </Button>
                    </div>

                    <Button
                        variant="default"
                        className="w-full bg-sky-500 hover:bg-sky-600 text-white"
                        onClick={openGoogleMaps}
                    >
                        <Navigation className="h-4 w-4 mr-2" />
                        Obtenir l'itinéraire
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
