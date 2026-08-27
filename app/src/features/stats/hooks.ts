import { useQuery } from "@tanstack/react-query";
import {
    getPaymentMethodBreakdown,
    getRevenueOverTime,
    getSummary,
    getTopProducts,
    getTopUsers,
} from "../../api/stats";

export function useRevenueOverTime(dateMin: string, dateMax: string) {
    return useQuery({
        queryKey: ["stats", "revenue", dateMin, dateMax],
        queryFn: () => getRevenueOverTime(dateMin, dateMax),
    });
}

export function useTopProducts(dateMin: string, dateMax: string) {
    return useQuery({
        queryKey: ["stats", "top-products", dateMin, dateMax],
        queryFn: () => getTopProducts(dateMin, dateMax),
    });
}

export function usePaymentMethodBreakdown(dateMin: string, dateMax: string) {
    return useQuery({
        queryKey: ["stats", "payment-methods", dateMin, dateMax],
        queryFn: () => getPaymentMethodBreakdown(dateMin, dateMax),
    });
}

export function useTopUsers(dateMin: string, dateMax: string) {
    return useQuery({
        queryKey: ["stats", "top-users", dateMin, dateMax],
        queryFn: () => getTopUsers(dateMin, dateMax),
    });
}

export function useSummary(dateMin: string, dateMax: string) {
    return useQuery({
        queryKey: ["stats", "summary", dateMin, dateMax],
        queryFn: () => getSummary(dateMin, dateMax),
    });
}
