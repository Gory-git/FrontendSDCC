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

// ── Esportazione della singola ricevuta ───────────────────────────────────────

const HEADERS_DETTAGLIO = [
    "Codice ricevuta",
    "Data",
    "Utente",
    "Metodo di pagamento",
    "Ultime 4 cifre",
    "Codice prodotto",
    "Prodotto",
    "Quantità",
    "Prezzo unitario",
    "Totale riga",
    "Imposta ricevuta",
    "Totale ricevuta",
];

/**
 * I dati della ricevuta sono ripetuti su ogni riga d'acquisto invece di stare in
 * un'intestazione separata. Costa qualche colonna ridondante, ma tiene il file
 * rettangolare: resta ordinabile e filtrabile in un foglio di calcolo, e più
 * esportazioni si possono impilare una sotto l'altra senza rimaneggiarle. Un
 * file a due blocchi di forma diversa non permetterebbe né l'una né l'altra cosa.
 */
function toDetailRows(receipt: ReceiptDTO): string[][] {
    const testa = [
        receipt.code,
        csvDateTime(receipt.date),
        receipt.userEmail,
        paymentMethodLabels[receipt.paymentMethod] ?? receipt.paymentMethod,
        receipt.cardLast4 ?? "",
    ];
    const coda = [csvNumber(receipt.tax), csvNumber(receipt.amount)];

    // Una ricevuta senza righe non deve produrre un file di sole intestazioni:
    // resta una riga con i campi del prodotto vuoti, così la ricevuta c'è.
    if (receipt.lines.length === 0)
        return [[...testa, "", "", "", "", "", ...coda]];

    return receipt.lines.map((line) => [
        ...testa,
        line.productCode,
        line.productName,
        String(line.quantity),
        csvNumber(line.price),
        csvNumber(line.price * line.quantity),
        ...coda,
    ]);
}

/** Il codice finisce nel nome del file: i caratteri non ammessi diventano trattini. */
function detailFilename(code: string): string {
    const sicuro = code.replace(/[^A-Za-z0-9._-]/g, "-");
    return `ricevuta-${sicuro}.csv`;
}

/**
 * Esporta una sola ricevuta con il dettaglio delle righe d'acquisto, che
 * l'esportazione dell'elenco non può contenere: lì ogni ricevuta occupa una riga
 * sola e dei prodotti resta il conteggio.
 */
export function exportReceiptDetailToCsv(receipt: ReceiptDTO): void {
    downloadCsv(detailFilename(receipt.code), buildCsv(HEADERS_DETTAGLIO, toDetailRows(receipt)));
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
