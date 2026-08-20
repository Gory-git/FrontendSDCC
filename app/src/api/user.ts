import { apiFetch } from "./client";
import type { ProductDTO, UserDTO } from "./types";

export async function registerUser(): Promise<void> {
    await apiFetch<void>("/user/register", { method: "POST" });
}

export async function getCurrentUser(): Promise<UserDTO> {
    return apiFetch<UserDTO>("/user/page");
}

export async function getProductOfTheMonth(): Promise<ProductDTO> {
    return apiFetch<ProductDTO>("/user/product-of-the-month");
}

export async function getProductOfTimeSpan(dateMin: string, dateMax: string): Promise<ProductDTO> {
    return apiFetch<ProductDTO>(
        `/user/product-of-time-span/${encodeURIComponent(dateMin)}/${encodeURIComponent(dateMax)}`
    );
}
