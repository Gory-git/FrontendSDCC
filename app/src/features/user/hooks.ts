import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    completeRegistration,
    getAllUsers,
    getCurrentUser,
    getProductOfTheMonth,
    getProductOfTimeSpan,
    registerUser,
    searchUsers,
    updateCurrentUser,
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

export function useUpdateCurrentUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCurrentUser,
        onSuccess: (user) => {
            // La card del profilo e la navbar leggono la stessa query: aggiornarla con
            // la risposta evita di mostrare i vecchi dati fino al refetch.
            queryClient.setQueryData(["current-user"], user);
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}

export function useCompleteRegistration() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: completeRegistration,
        onSuccess: () => {
            // Rileggere il profilo fa cadere la guardia e sblocca l'app.
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
        },
    });
}

export function useAllUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: getAllUsers,
    });
}

export function useUserSearch(query: string, threshold: number, enabled = true) {
    return useQuery({
        queryKey: ["users", "search", query, threshold],
        queryFn: () => searchUsers(query, threshold),
        enabled: enabled && !!query,
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
