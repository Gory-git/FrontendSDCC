import { apiFetch } from "./client";
import type { ProductDTO } from "./types";

export async function getAllProducts(): Promise<ProductDTO[]> {
    return apiFetch<ProductDTO[]>("/product/all");
}
