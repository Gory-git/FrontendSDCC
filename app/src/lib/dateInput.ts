// Tenere allineato a DateValidator.MIN_INSTANT nel backend (2025-01-01T08:30:00Z).
// Per i date-picker "solo data" si usa il giorno successivo, così qualunque
// orario venga ricostruito lato client (es. T00:00:00Z) resta comunque valido.
export const APP_MIN_DATE = "2025-01-02";
export const APP_MIN_DATETIME_LOCAL = "2025-01-01T08:30";

function toDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export function todayDateString(): string {
    return toDateInputValue(new Date());
}

export function daysAgoDateString(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return toDateInputValue(d);
}

export function nowForDatetimeLocal(): string {
    const now = new Date();
    now.setSeconds(0, 0);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}

export function startOfDayIso(dateString: string): string {
    return new Date(`${dateString}T00:00:00.000Z`).toISOString();
}

/**
 * Fine giornata in ISO, limitata a "adesso" se la data scelta è oggi (o nel
 * futuro): il backend rifiuta qualunque istante successivo a Instant.now(),
 * quindi "fine del giorno odierno" andrebbe quasi sempre rifiutata perché è
 * nel futuro rispetto al momento esatto della richiesta.
 */
export function endOfDayIsoClamped(dateString: string): string {
    const endOfDay = new Date(`${dateString}T23:59:59.999Z`);
    const now = new Date();
    return (endOfDay > now ? now : endOfDay).toISOString();
}
