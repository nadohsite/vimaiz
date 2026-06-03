import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';

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

    useEffect(() => {
        if (query.length < 3) {
            setResults([]);
            setShowDropdown(false);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const controller = new AbortController();

        const timer = window.setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?` +
                    new URLSearchParams({
                        q: query,
                        format: 'json',
                        addressdetails: '1',
                        limit: '5',
                        countrycodes: 'fr',
                    }),
                    {
                        headers: {
                            'Accept-Language': 'fr',
                        },
                        signal: controller.signal,
                    },
                );

                if (response.ok) {
                    const data: AddressResult[] = await response.json();
                    setResults(data);
                    setShowDropdown(data.length > 0);
                    setSelectedIndex(-1);
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                console.error('Address search failed:', error);
                setResults([]);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }, 300);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
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
        setQuery(parsed.address_line1);
        setShowDropdown(false);
        setResults([]);
        onAddressSelect(parsed);
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
                    className="pl-10 pr-10"
                    autoComplete="off"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
                )}
            </div>

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
