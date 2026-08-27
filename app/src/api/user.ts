import { apiFetch } from "./client";
import type { ProductDTO, UserDTO, UserUpdateDTO } from "./types";

export async function registerUser(dto: UserDTO): Promise<void> {
    await apiFetch<void>("/user/register",
        {
            method: "POST",
            body: JSON.stringify(dto)
        });
}

/**
 * Crea la riga nel database per un utente già autenticato su Firebase. Stesso
 * endpoint della registrazione: email e ruolo li ricava il backend dal token,
 * quindi qui bastano i dati anagrafici.
 */
export async function completeRegistration(dto: UserUpdateDTO): Promise<void> {
    await apiFetch<void>("/user/register",
        {
            method: "POST",
            body: JSON.stringify(dto)
        });
}

export async function getCurrentUser(): Promise<UserDTO> {
    return apiFetch<UserDTO>("/user/page");
}

/** Aggiorna i dati anagrafici dell'utente autenticato e restituisce il profilo salvato. */
export async function updateCurrentUser(dto: UserUpdateDTO): Promise<UserDTO> {
    return apiFetch<UserDTO>("/user/update",
        {
            method: "PUT",
            body: JSON.stringify(dto)
        });
}

export async function getAllUsers(): Promise<UserDTO[]> {
    return apiFetch<UserDTO[]>("/user/list");
}

/** Ricerca fuzzy per email, nome, cognome o codice fiscale (solo ADMIN). */
export async function searchUsers(query: string, threshold: number): Promise<UserDTO[]> {
    return apiFetch<UserDTO[]>(
        `/user/find?query=${encodeURIComponent(query)}&threshold=${threshold}`
    );
}

export async function getProductOfTheMonth(): Promise<ProductDTO> {
    return apiFetch<ProductDTO>("/user/product-of-the-month");
}

export async function getProductOfTimeSpan(dateMin: string, dateMax: string): Promise<ProductDTO> {
    return apiFetch<ProductDTO>(
        `/user/product-of-time-span?dateMin=${encodeURIComponent(dateMin)}&dateMax=${encodeURIComponent(dateMax)}`
    );
}
