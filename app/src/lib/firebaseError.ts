/**
 * Messaggi per gli errori di Firebase Auth. Come per gli errori del backend,
 * il testo originale non arriva mai all'utente: è inglese e tecnico, e per i
 * codici non mappati direbbe comunque solo "auth/qualcosa".
 */

const MESSAGES: Record<string, string> = {
    "auth/email-already-in-use":   "Questa email è già registrata.",
    "auth/invalid-email":          "Formato email non valido.",
    "auth/weak-password":          "Password troppo debole.",
    "auth/network-request-failed": "Errore di rete. Controlla la connessione.",
    "auth/invalid-credential":     "Email o password non corretti.",
    "auth/wrong-password":         "Email o password non corretti.",
    "auth/user-not-found":         "Email o password non corretti.",
    "auth/user-disabled":          "Questo account è stato disabilitato.",
    "auth/too-many-requests":      "Troppi tentativi. Riprova tra qualche minuto.",
    "auth/requires-recent-login":  "Per sicurezza devi rifare l'accesso prima di questa operazione.",
};

/** True se l'errore arriva da Firebase Auth (ha un `code` "auth/..."). */
export function isFirebaseError(error: unknown): error is { code: string } {
    return (
        typeof error === "object" && error !== null && "code" in error &&
        typeof (error as { code: unknown }).code === "string" &&
        (error as { code: string }).code.startsWith("auth/")
    );
}

export function firebaseErrorMessage(error: unknown, fallback: string): string {
    if (isFirebaseError(error)) return MESSAGES[error.code] ?? fallback;
    return fallback;
}
