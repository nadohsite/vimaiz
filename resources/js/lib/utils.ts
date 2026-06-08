import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isSameUrl(
    url1: NonNullable<InertiaLinkProps['href']>,
    url2: NonNullable<InertiaLinkProps['href']>,
) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    const resolved = typeof url === 'string' ? url : url.url;

    if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
        try {
            return new URL(resolved).pathname;
        } catch {
            return resolved;
        }
    }

    return resolved;
}

/**
 * Retourne l'URL correcte pour un avatar.
 * Si l'avatar est une URL externe (Google, etc.), retourne l'URL telle quelle.
 * Si c'est un chemin local, ajoute /storage/ devant.
 * Si pas d'avatar, retourne un placeholder avec les initiales.
 */
export function getAvatarUrl(avatar: string | null | undefined, name?: string): string {
    if (!avatar) {
        return name 
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff`
            : `https://ui-avatars.com/api/?name=U&background=0ea5e9&color=fff`;
    }
    
    // Si c'est une URL externe (commence par http:// ou https://)
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
        return avatar;
    }
    
    if (avatar.startsWith('/storage/')) {
        return avatar;
    }

    if (avatar.startsWith('storage/')) {
        return `/${avatar}`;
    }

    // Sinon, c'est un chemin local
    return `/storage/${avatar}`;
}

/**
 * URL publique pour un fichier stocké sur le disque public (missions, documents, etc.).
 */
export function getStorageUrl(path: string | null | undefined): string {
    if (!path) {
        return '';
    }
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
        return path;
    }
    return `/storage/${path}`;
}
