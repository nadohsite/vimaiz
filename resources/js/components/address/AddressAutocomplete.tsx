import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, LocateFixed } from 'lucide-react';
import debounce from 'lodash/debounce';

interface AddressResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address: {
        house_number?: string;
        road?: string;
        suburb?: string;
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        postcode?: string;
        country?: string;
    };
}

interface ParsedAddress {
    address_line1: string;
    city: string;
    postal_code: string;
    latitude: number;
    longitude: number;
}

interface Props {
    onAddressSelect: (address: ParsedAddress) => void;
    initialValue?: string;
    placeholder?: string;
    className?: string;
}

export default function AddressAutocomplete({ 
    onAddressSelect, 
    initialValue = '', 
    placeholder = 'Rechercher une adresse...',
    className = ''
}: Props) {
    const [query, setQuery] = useState(initialValue);
    const [results, setResults] = useState<AddressResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search function
    const searchAddress = useCallback(
        debounce(async (searchQuery: string) => {
            if (searchQuery.length < 3) {
                setResults([]);
                setShowDropdown(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?` + 
                    new URLSearchParams({
                        q: searchQuery,
                        format: 'json',
                        addressdetails: '1',
                        limit: '5',
                        countrycodes: 'fr',
                    }),
                    {
                        headers: {
                            'Accept-Language': 'fr',
                        },
                    }
                );

                if (response.ok) {
                    const data: AddressResult[] = await response.json();
                    setResults(data);
                    setShowDropdown(data.length > 0);
                    setSelectedIndex(-1);
                }
            } catch (error) {
                console.error('Address search failed:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        []
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        searchAddress(value);
    };

    const parseAddress = (result: AddressResult): ParsedAddress => {
        const addr = result.address;
        
        // Build address line 1
        const houseNumber = addr.house_number || '';
        const road = addr.road || '';
        const addressLine1 = [houseNumber, road].filter(Boolean).join(' ').trim() || result.display_name.split(',')[0];

        // Get city (can be in different fields)
        const city = addr.city || addr.town || addr.village || addr.municipality || '';

        // Get postal code
        const postalCode = addr.postcode || '';

        return {
            address_line1: addressLine1,
            city: city,
            postal_code: postalCode,
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
        };
    };

    const handleSelect = (result: AddressResult) => {
        const parsed = parseAddress(result);

        if (!Number.isFinite(parsed.latitude) || !Number.isFinite(parsed.longitude)) {
            return;
        }

        setQuery(parsed.address_line1);
        setShowDropdown(false);
        setResults([]);
        onAddressSelect(parsed);
    };

    const parseReverseResult = (result: AddressResult, latitude: number, longitude: number): ParsedAddress => {
        const addr = result.address || {};
        const houseNumber = addr.house_number || '';
        const road = addr.road || '';
        const addressLine1 = [houseNumber, road].filter(Boolean).join(' ').trim()
            || result.display_name?.split(',')[0]
            || '';
        const city = addr.city || addr.town || addr.village || addr.municipality || '';
        const postalCode = addr.postcode || '';

        return {
            address_line1: addressLine1,
            city,
            postal_code: postalCode,
            // Keep the device's actual GPS coordinates rather than the
            // reverse-geocoded address's centroid — more precise when the
            // client is standing at the property itself.
            latitude,
            longitude,
        };
    };

    const handleUseMyLocation = () => {
        setLocationError(null);

        if (!('geolocation' in navigator)) {
            setLocationError("La géolocalisation n'est pas disponible sur cet appareil.");
            return;
        }

        setShowDropdown(false);
        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?` +
                        new URLSearchParams({
                            lat: String(latitude),
                            lon: String(longitude),
                            format: 'json',
                            addressdetails: '1',
                        }),
                        { headers: { 'Accept-Language': 'fr' } }
                    );

                    const parsed = response.ok
                        ? parseReverseResult(await response.json(), latitude, longitude)
                        : { address_line1: query, city: '', postal_code: '', latitude, longitude };

                    if (parsed.address_line1) {
                        setQuery(parsed.address_line1);
                    }
                    setResults([]);
                    setShowDropdown(false);
                    onAddressSelect(parsed);
                } catch (error) {
                    console.error('Reverse geocoding failed:', error);
                    // The address text couldn't be resolved, but the GPS
                    // coordinates themselves are still valid and useful.
                    onAddressSelect({ address_line1: query, city: '', postal_code: '', latitude, longitude });
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                setIsLocating(false);
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationError("Localisation refusée. Autorisez l'accès à votre position dans les réglages du navigateur.");
                } else if (error.code === error.TIMEOUT) {
                    setLocationError('La localisation a pris trop de temps. Réessayez.');
                } else {
                    setLocationError('Impossible de récupérer votre position actuelle.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleSelect(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                break;
        }
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                    placeholder={placeholder}
                    className="pl-10 pr-16"
                    autoComplete="off"
                />
                {isLoading && (
                    <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
                )}
                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    title="Utiliser ma position actuelle"
                    aria-label="Utiliser ma position actuelle"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-sky-900/30 dark:hover:text-sky-400 transition-colors"
                >
                    {isLocating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <LocateFixed className="h-4 w-4" />
                    )}
                </button>
            </div>

            {locationError && (
                <p className="mt-1 text-xs text-red-500">{locationError}</p>
            )}

            {showDropdown && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {results.map((result, index) => (
                        <button
                            key={result.place_id}
                            type="button"
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                                index === selectedIndex
                                    ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-medium truncate dark:text-white">
                                        {result.address.house_number} {result.address.road || result.display_name.split(',')[0]}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {result.address.postcode} {result.address.city || result.address.town || result.address.village}
                                        {result.address.country && `, ${result.address.country}`}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
