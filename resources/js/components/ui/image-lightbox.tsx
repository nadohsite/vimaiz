import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageLightboxProps {
    images: { src: string; alt?: string; caption?: string }[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
}

export function ImageLightbox({ images, initialIndex = 0, isOpen, onClose }: ImageLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        setCurrentIndex(initialIndex);
        setZoom(1);
    }, [initialIndex, isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || images.length === 0) return null;

    const currentImage = images[currentIndex];

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        setZoom(1);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        setZoom(1);
    };

    const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 3));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 0.5, 1));

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
                <X className="h-6 w-6" />
            </button>

            {/* Zoom controls */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <button
                    onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                    className="p-1 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-50"
                    disabled={zoom <= 1}
                >
                    <ZoomOut className="h-5 w-5" />
                </button>
                <span className="text-white text-sm min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
                <button
                    onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                    className="p-1 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-50"
                    disabled={zoom >= 3}
                >
                    <ZoomIn className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                        className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); goToNext(); }}
                        className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>
                </>
            )}

            {/* Image container */}
            <div 
                className="max-w-[90vw] max-h-[85vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={currentImage.src}
                    alt={currentImage.alt || 'Image'}
                    className="max-h-[85vh] object-contain transition-transform duration-200"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                />
            </div>

            {/* Caption and counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-center">
                {currentImage.caption && (
                    <p className="text-white text-sm mb-2 bg-black/50 px-4 py-2 rounded-lg">
                        {currentImage.caption}
                    </p>
                )}
                {images.length > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-white/80 text-sm">
                            {currentIndex + 1} / {images.length}
                        </span>
                        <div className="flex gap-1">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); setZoom(1); }}
                                    className={`w-2 h-2 rounded-full transition-colors ${
                                        idx === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
