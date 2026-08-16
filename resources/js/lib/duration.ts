export function formatDurationMinutes(minutes: number | null | undefined): string {
    if (minutes == null || Number.isNaN(minutes) || minutes < 0) {
        return '—';
    }

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, '0')}`;
}

export function elapsedMinutesBetween(
    startedAt: string | null | undefined,
    endedAt?: string | null,
): number | null {
    if (!startedAt) {
        return null;
    }

    const start = new Date(startedAt).getTime();
    if (Number.isNaN(start)) {
        return null;
    }

    const end = endedAt ? new Date(endedAt).getTime() : Date.now();
    if (Number.isNaN(end)) {
        return null;
    }

    return Math.max(0, Math.round((end - start) / 60000));
}
