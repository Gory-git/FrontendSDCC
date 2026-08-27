import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./errors";

/**
 * 408 (Request Timeout) e 429 (Too Many Requests) sono gli unici 4xx che vale
 * la pena ritentare: in entrambi i casi e' il server a dire "riprova".
 */
const RETRYABLE_CLIENT_ERRORS = [408, 429];

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Un 4xx descrive la richiesta, non un guasto transitorio: ritentarlo
            // non ne cambia l'esito e aggiunge solo attesa (il 404 "nessun prodotto
            // del mese" teneva la card in caricamento per ~8s di backoff). Errori di
            // rete e 5xx mantengono il comportamento di default.
            retry: (failureCount, error) => {
                if (
                    error instanceof ApiError &&
                    error.status >= 400 &&
                    error.status < 500 &&
                    !RETRYABLE_CLIENT_ERRORS.includes(error.status)
                )
                    return false;
                return failureCount < 3;
            },
        },
    },
});
