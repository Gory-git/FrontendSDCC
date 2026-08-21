import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addProduct,
    deleteProduct,
    findProducts,
    getAllProducts,
    getProductOfTheMonthForUser,
    getProductOfTimeSpanForUser,
} from "../../api/product";

export function useAllProducts() {
    return useQuery({
        queryKey: ["products"],
        queryFn: getAllProducts,
    });
}

export function useAddProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
}

export function useProductSearch(query: string, threshold: number, enabled = true) {
    return useQuery({
        queryKey: ["products", "search", query, threshold],
        queryFn: () => findProducts(query, threshold),
        enabled: enabled && !!query,
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
}

export function useProductOfTheMonthForUser(userEmail: string, enabled = true) {
    return useQuery({
        queryKey: ["products", "of-the-month", userEmail],
        queryFn: () => getProductOfTheMonthForUser(userEmail),
        enabled: enabled && !!userEmail,
    });
}

export function useProductOfTimeSpanForUser(
    userEmail: string, dateMin?: string, dateMax?: string
) {
    return useQuery({
        queryKey: ["products", "of-time-span", userEmail, dateMin, dateMax],
        queryFn: () => getProductOfTimeSpanForUser(userEmail, dateMin!, dateMax!),
        enabled: !!userEmail && !!dateMin && !!dateMax,
    });
}
