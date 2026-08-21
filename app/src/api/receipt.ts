import { apiFetch } from "./client";
import type { ReceiptDTO } from "./types";

export async function getAllReceipts(sortByDate: boolean): Promise<ReceiptDTO[]> {
    return apiFetch<ReceiptDTO[]>(`/receipt/all/${sortByDate}`);
}

export async function getReceipt(code: string): Promise<ReceiptDTO> {
    return apiFetch<ReceiptDTO>(`/receipt/${encodeURIComponent(code)}`);
}

export async function deleteReceipt(code: string): Promise<void> {
    await apiFetch<void>(`/receipt/${encodeURIComponent(code)}`, {
        method: "DELETE",
    });
}

export async function addReceipt(dto: ReceiptDTO): Promise<void> {
    await apiFetch<void>("/receipt/add", {
        method: "POST",
        body: JSON.stringify(dto),
    });
}

export async function uploadReceiptPdf(file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    await apiFetch<void>("/receipt/upload-pdf", {
        method: "POST",
        body: formData,
    });
}

export async function getReceiptPdfUrl(code: string): Promise<string> {
    // L'endpoint produce solo text/plain: l'Accept di default di apiFetch è
    // application/json, quindi va sovrascritto qui o Spring risponde 406.
    return apiFetch<string>(`/receipt/pdf/${encodeURIComponent(code)}`, {
        headers: { Accept: "text/plain" },
    });
}

/**
 * Ricerca fuzzy per email utente (solo ADMIN). Il backend accetta soglie
 * in [0, 1]: essendo il punteggio di FuzzyScore un intero, in pratica ogni
 * soglia < 1 si comporta come "punteggio > 0" e solo 1 è più restrittivo.
 */
export async function getReceiptsByUserEmail(email: string, threshold: number): Promise<ReceiptDTO[]> {
    return apiFetch<ReceiptDTO[]>(
        `/receipt/find-by-email-like/${encodeURIComponent(email)}?threshold=${threshold}`
    );
}

/**
 * Ricerca fuzzy per codice ricevuta. Il backend limita i risultati alle
 * ricevute dell'utente corrente, a meno che non sia ADMIN.
 */
export async function getReceiptsByCode(code: string, threshold: number): Promise<ReceiptDTO[]> {
    return apiFetch<ReceiptDTO[]>(
        `/receipt/find-by-code-like/${encodeURIComponent(code)}?threshold=${threshold}`
    );
}
