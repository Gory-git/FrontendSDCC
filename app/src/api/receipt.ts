import { apiFetch } from "./client";
import type { ReceiptDTO } from "./types";

export async function getAllReceipts(sortByDate: boolean): Promise<ReceiptDTO[]> {
    return apiFetch<ReceiptDTO[]>(`/receipt/all/${sortByDate}`);
}

export async function getReceipt(code: string): Promise<ReceiptDTO> {
    return apiFetch<ReceiptDTO>(`/receipt/${encodeURIComponent(code)}`);
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
    return apiFetch<string>(`/receipt/pdf/${encodeURIComponent(code)}`);
}
