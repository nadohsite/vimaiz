/**
 * Appointment times are stored as naive wall-clock (the hour the client chose).
 * We never convert through the browser timezone so 09:00 stays 09:00.
 */

type WallClock = {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
};

function parseWallClock(value: string): WallClock | null {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);

    if (!match) {
        return null;
    }

    return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
        hour: Number(match[4] ?? '0'),
        minute: Number(match[5] ?? '0'),
    };
}

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

function formatCalendarDay(parts: WallClock, options: Intl.DateTimeFormatOptions): string {
    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));

    return date.toLocaleDateString('fr-FR', {
        timeZone: 'UTC',
        ...options,
    });
}

export function formatAppointmentDate(
    value: string | null | undefined,
    options: Intl.DateTimeFormatOptions = {},
): string {
    if (!value) {
        return '—';
    }

    const parts = parseWallClock(value);

    if (!parts) {
        return '—';
    }

    return formatCalendarDay(parts, options);
}

export function formatAppointmentTime(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    const parts = parseWallClock(value);

    if (parts && /[T ]\d{2}:\d{2}/.test(value)) {
        return `${pad(parts.hour)}:${pad(parts.minute)}`;
    }

    return formatRequestTime(value);
}

export function formatAppointmentDateTime(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    const parts = parseWallClock(value);

    if (!parts) {
        return '—';
    }

    const dateLabel = formatCalendarDay(parts, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

    if (!/[T ]\d{2}:\d{2}/.test(value)) {
        return dateLabel;
    }

    return `${dateLabel} à ${pad(parts.hour)}:${pad(parts.minute)}`;
}

/** Formats a TIME that may be "09:00", "09:00:00" or a leaked ISO datetime. */
export function formatRequestTime(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    const match = value.match(/(\d{2}:\d{2})/);

    return match ? match[1] : value;
}

/**
 * Mission.scheduled_at is a REAL UTC instant (unlike the naive wall-clock
 * request fields above). These formatters explicitly convert to the
 * business timezone so the displayed hour is correct no matter where the
 * viewer's browser is set — never rely on the browser's own local timezone
 * for this field, and never mix it with the naive formatters above.
 */
const BUSINESS_TIMEZONE = 'Europe/Paris';

function parseInstant(value: string | null | undefined): Date | null {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatInstantDate(
    value: string | null | undefined,
    options: Intl.DateTimeFormatOptions = {},
): string {
    const date = parseInstant(value);

    if (!date) {
        return '—';
    }

    return date.toLocaleDateString('fr-FR', { timeZone: BUSINESS_TIMEZONE, ...options });
}

export function formatInstantTime(value: string | null | undefined): string {
    const date = parseInstant(value);

    if (!date) {
        return '—';
    }

    return date.toLocaleTimeString('fr-FR', {
        timeZone: BUSINESS_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatInstantDateTime(value: string | null | undefined): string {
    const date = parseInstant(value);

    if (!date) {
        return '—';
    }

    const dateLabel = date.toLocaleDateString('fr-FR', {
        timeZone: BUSINESS_TIMEZONE,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

    const timeLabel = date.toLocaleTimeString('fr-FR', {
        timeZone: BUSINESS_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${dateLabel} à ${timeLabel}`;
}
