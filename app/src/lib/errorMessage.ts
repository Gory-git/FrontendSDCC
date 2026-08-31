import { ApiError, AuthError } from "../api/errors";

/**
 * Traduce un errore in un messaggio mostrabile all'utente. Il testo che arriva
 * dal backend non viene mai propagato all'interfaccia: è scritto per chi
 * sviluppa (spesso in inglese, a volte con dettagli interni) e non aiuta chi
 * usa l'app. Chi chiama passa un `fallback` che descrive l'operazione fallita.
 */

const SESSION_EXPIRED = "Sessione non più valida. Esegui di nuovo l'accesso.";
const SERVER_PROBLEM = "Il server ha avuto un problema. Riprova tra poco.";
const UNREACHABLE = "Impossibile contattare il server. Controlla la connessione.";

// I 404 restano fuori: "non trovato" dipende dal contesto, lo descrive il
// `fallback` di chi chiama.
const BY_STATUS: Record<number, string> = {
    400: "Alcuni dati non sono validi. Controlla i campi e riprova.",
    401: SESSION_EXPIRED,
    403: "Non hai i permessi per questa operazione.",
    409: "Questi dati sono già associati a un altro elemento.",
    413: "Il file è troppo grande.",
    429: "Hai fatto troppe richieste. Riprova più tardi.",
    415: "Formato del file non supportato.",
};

export function errorMessage(
    error: unknown,
    fallback = "Qualcosa è andato storto. Riprova.",
): string {
    if (error instanceof AuthError) return SESSION_EXPIRED;
    if (error instanceof ApiError) {
        if (error.status === 0) return UNREACHABLE;
        if (error.status >= 500) return SERVER_PROBLEM;
        return BY_STATUS[error.status] ?? fallback;
    }
    return fallback;
}

/** Per distinguere "nessun risultato" da un errore vero al sito di chiamata. */
export function isNotFound(error: unknown): boolean {
    return error instanceof ApiError && error.status === 404;
}

/**
 * Limite d'uso raggiunto (il backend lo applica alle domande al chatbot). Serve
 * a chi chiama per non offrire un "Riprova" che fallirebbe di sicuro.
 */
export function isTooManyRequests(error: unknown): boolean {
    return error instanceof ApiError && error.status === 429;
}
