import type { ReceiptDTO } from "../../api/types";
import { buildCsv, csvDateTime, csvNumber, downloadCsv } from "../../lib/csv";
import { paymentMethodLabels } from "./formatters";

const HEADERS = [
    "Codice",
    "Data",
    "Utente",
    "Metodo di pagamento",
    "Ultime 4 cifre",
    "Imposta",
    "Totale",
    "Articoli",
];

function toRow(receipt: ReceiptDTO): string[] {
    // Somma delle quantità, non numero di righe: due unità dello stesso prodotto
    // stanno su una riga sola e vanno contate due volte.
    const articoli = receipt.lines.reduce((somma, riga) => somma + riga.quantity, 0);

    return [
        receipt.code,
        csvDateTime(receipt.date),
        receipt.userEmail,
        paymentMethodLabels[receipt.paymentMethod] ?? receipt.paymentMethod,
        receipt.cardLast4 ?? "",
        csvNumber(receipt.tax),
        csvNumber(receipt.amount),
        String(articoli),
    ];
}

/** `ricevute-2026-09-02.csv`: la data in formato ISO tiene i file in ordine alfabetico. */
function filename(): string {
    const oggi = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `ricevute-${oggi.getFullYear()}-${pad(oggi.getMonth() + 1)}-${pad(oggi.getDate())}.csv`;
}

/**
 * Esporta le ricevute passate, che sono quelle attualmente mostrate: filtri,
 * ricerca e ordinamento valgono anche per il file. Esportare sempre tutto
 * sarebbe stato più semplice ma avrebbe reso il pulsante scollegato da ciò
 * che l'utente ha davanti.
 */
export function exportReceiptsToCsv(receipts: ReceiptDTO[]): void {
    downloadCsv(filename(), buildCsv(HEADERS, receipts.map(toRow)));
}
