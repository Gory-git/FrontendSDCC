import { apiFetch } from "./client";
import type { ProductDTO, UserDTO } from "./types";

export async function registerUser(dto: UserDTO): Promise<void> {
    await apiFetch<void>("/user/register",
        {
            method: "POST",
            body: JSON.stringify(dto)
        });
}

export async function getCurrentUser(): Promise<UserDTO> {
    return apiFetch<UserDTO>("/user/page");
}

export async function getAllUsers(): Promise<UserDTO[]> {
    return apiFetch<UserDTO[]>("/user/list");
}

export async function findUsersByEmail(email: string, threshold: number): Promise<UserDTO[]> {
    return apiFetch<UserDTO[]>(
        `/user/find?email=${encodeURIComponent(email)}&threshold=${threshold}`
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
