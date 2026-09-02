import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserDTO, UserUpdateDTO } from "../../api/types";
import {
    completeRegistration,
    getAllUsers,
    getCurrentUser,
    getProductOfTheMonth,
    getProductOfTimeSpan,
    registerUser,
    searchUsers,
    updateCurrentUser,
    updateUserByEmail,
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

/**
 * Modifica il profilo di un altro utente (solo ADMIN). L'email è fissata nell'hook,
 * così la mutazione ha la stessa forma di useUpdateCurrentUser e il form si riusa
 * senza sapere quale dei due sta salvando.
 */
export function useUpdateUserByEmail(email: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: UserUpdateDTO) => updateUserByEmail(email, dto),
        onSuccess: (user) => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            // Un admin può modificare anche se stesso dalla pagina utenti. La card del
            // profilo e la navbar leggono ["current-user"], che non è toccata da
            // invalidateQueries(["users"]) e resterebbe ferma ai dati vecchi.
            const current = queryClient.getQueryData<UserDTO>(["current-user"]);
            if (current?.email === user.email)
                queryClient.setQueryData(["current-user"], user);
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

/**
 * Dettaglio di un utente a partire dall'email. Non esiste un endpoint dedicato
 * (`UserController` espone solo /page, /list e /find), quindi si riusa la lista
 * admin: usando la **stessa** queryKey ["users"] il dato è già in cache quando
 * si arriva dalla pagina utenti, e `select` filtra senza duplicare nulla.
 */
export function useUserByEmail(email: string) {
    return useQuery({
        queryKey: ["users"],
        queryFn: getAllUsers,
        select: (users: UserDTO[]) => users.find((user) => user.email === email),
        enabled: !!email,
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
