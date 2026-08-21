import { apiFetch } from "./client";
import type { ProductDTO } from "./types";

export async function getAllProducts(): Promise<ProductDTO[]> {
    return apiFetch<ProductDTO[]>("/product/all");
}

export async function addProduct(dto: ProductDTO): Promise<void> {
    await apiFetch<void>("/product/add", {
        method: "POST",
        body: JSON.stringify(dto),
    });
}

export async function deleteProduct(code: string): Promise<void> {
    await apiFetch<void>(`/product/${encodeURIComponent(code)}`, {
        method: "DELETE",
    });
}

/** Ricerca fuzzy per nome o codice prodotto (soglia in [0,1], vedi ThresholdSlider). */
export async function findProducts(query: string, threshold: number): Promise<ProductDTO[]> {
    return apiFetch<ProductDTO[]>(
        `/product/find?query=${encodeURIComponent(query)}&threshold=${threshold}`
    );
}

/** Uso ADMIN: prodotto più acquistato da un utente specifico negli ultimi 30 giorni. */
export async function getProductOfTheMonthForUser(userEmail: string): Promise<ProductDTO> {
    return apiFetch<ProductDTO>(`/product/product-of-the-month/${encodeURIComponent(userEmail)}`);
}

/** Uso ADMIN: prodotto più acquistato da un utente specifico in un intervallo di date. */
export async function getProductOfTimeSpanForUser(
    userEmail: string, dateMin: string, dateMax: string
): Promise<ProductDTO> {
    return apiFetch<ProductDTO>(
        `/product/product-of-time-span/${encodeURIComponent(userEmail)}/${encodeURIComponent(dateMin)}/${encodeURIComponent(dateMax)}`
    );
}
