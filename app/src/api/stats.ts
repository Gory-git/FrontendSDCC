import { apiFetch } from "./client";
import type {
    PaymentMethodStatDTO,
    ProductStatDTO,
    RevenuePointDTO,
    SummaryStatsDTO,
    UserStatDTO,
} from "./types";

function rangeQuery(dateMin: string, dateMax: string): string {
    return `dateMin=${encodeURIComponent(dateMin)}&dateMax=${encodeURIComponent(dateMax)}`;
}

export async function getRevenueOverTime(dateMin: string, dateMax: string): Promise<RevenuePointDTO[]> {
    return apiFetch<RevenuePointDTO[]>(`/admin/stats/revenue?${rangeQuery(dateMin, dateMax)}`);
}

export async function getTopProducts(dateMin: string, dateMax: string, limit = 10): Promise<ProductStatDTO[]> {
    return apiFetch<ProductStatDTO[]>(`/admin/stats/top-products?${rangeQuery(dateMin, dateMax)}&limit=${limit}`);
}

export async function getPaymentMethodBreakdown(dateMin: string, dateMax: string): Promise<PaymentMethodStatDTO[]> {
    return apiFetch<PaymentMethodStatDTO[]>(`/admin/stats/payment-methods?${rangeQuery(dateMin, dateMax)}`);
}

export async function getTopUsers(dateMin: string, dateMax: string, limit = 10): Promise<UserStatDTO[]> {
    return apiFetch<UserStatDTO[]>(`/admin/stats/top-users?${rangeQuery(dateMin, dateMax)}&limit=${limit}`);
}

export async function getSummary(dateMin: string, dateMax: string): Promise<SummaryStatsDTO> {
    return apiFetch<SummaryStatsDTO>(`/admin/stats/summary?${rangeQuery(dateMin, dateMax)}`);
}
