/**
 * Generazione e scaricamento di file CSV.
 *
 * Il separatore è il punto e virgola e i decimali usano la virgola, perché il
 * destinatario di questi file è un foglio di calcolo aperto con impostazioni
 * italiane: con la virgola come separatore, Excel in italiano mette l'intera
 * riga in una sola cella. È una scelta di compatibilità, non lo standard RFC.
 */

const SEPARATOR = ";";

/**
 * Racchiude il campo fra virgolette se contiene il separatore, virgolette o un
 * a capo, raddoppiando le virgolette interne. Un campo che non ne ha bisogno
 * resta nudo, così il file è leggibile anche a occhio.
 */
function escapeField(value: string): string {
    if (value.includes(SEPARATOR) || value.includes('"') || value.includes("\n") || value.includes("\r"))
        return `"${value.replace(/"/g, '""')}"`;
    return value;
}

export function buildCsv(headers: string[], rows: string[][]): string {
    return [headers, ...rows]
        .map((row) => row.map(escapeField).join(SEPARATOR))
        .join("\r\n");
}

/** Numero con la virgola decimale e due cifre, come lo scrive un foglio italiano. */
export function csvNumber(value: number): string {
    return value.toFixed(2).replace(".", ",");
}

/** `gg/mm/aaaa hh:mm`: è il formato che Excel in italiano riconosce come data. */
export function csvDateTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";

    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Avvia lo scaricamento del contenuto come file. Il BOM iniziale serve a Excel:
 * senza, il file viene letto con la codifica di sistema e le lettere accentate
 * arrivano storpiate.
 */
export function downloadCsv(filename: string, csv: string): void {
    const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Senza revoca il blob resta in memoria finché la scheda non viene chiusa.
    URL.revokeObjectURL(url);
}
