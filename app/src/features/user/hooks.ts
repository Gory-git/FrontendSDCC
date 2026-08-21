import { useMutation, useQuery } from "@tanstack/react-query";
import {
    findUsersByEmail,
    getAllUsers,
    getCurrentUser,
    getProductOfTheMonth,
    getProductOfTimeSpan,
    registerUser,
} from "../../api/user";

export function useRegisterUser() {
    return useMutation({
        mutationFn: registerUser,
    });
}

export function useCurrentUser() {
    return useQuery({
        queryKey: ["current-user"],
        queryFn: getCurrentUser,
    });
}

export function useAllUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: getAllUsers,
    });
}

export function useUsersByEmail(email: string, threshold: number, enabled = true) {
    return useQuery({
        queryKey: ["users", "search", email, threshold],
        queryFn: () => findUsersByEmail(email, threshold),
        enabled: enabled && !!email,
    });
}

export function useProductOfTheMonth() {
    return useQuery({
        queryKey: ["product-of-the-month"],
        queryFn: getProductOfTheMonth,
    });
}

export function useProductOfTimeSpan(dateMin?: string, dateMax?: string) {
    return useQuery({
        queryKey: ["product-by-range", dateMin, dateMax],
        queryFn: () => getProductOfTimeSpan(dateMin!, dateMax!),
        enabled: !!dateMin && !!dateMax,
    });
}
