import {
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    type User,
} from "firebase/auth";
import { isFirebaseError } from "../lib/firebaseError";
import { getFirebaseAuth } from "./firebase";
import { queryClient } from "../api/queryClient";
import { clearConversation } from "../features/chat/conversation";

export function observeAuth(callback: (user: User | null) => void) {
    return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function loginWithEmailPassword(email: string, password: string) {
    return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

/**
 * Invia l'email di reimpostazione della password. La pagina di reset la ospita
 * Firebase, quindi non serve nessuna rotta nostra e nessuna modifica al backend:
 * le password non passano mai da lì.
 *
 * Un'email non registrata NON viene segnalata come errore. Firebase, con la
 * protezione contro l'enumerazione attiva, non lo rivela già di suo; qui il caso
 * è gestito comunque perché se quella protezione fosse disattivata sul progetto,
 * una risposta diversa fra "inviata" e "utente inesistente" permetterebbe a
 * chiunque di scoprire quali indirizzi sono iscritti.
 */
export async function sendPasswordReset(email: string) {
    try {
        await sendPasswordResetEmail(getFirebaseAuth(), email);
    } catch (error) {
        if (isFirebaseError(error) && error.code === "auth/user-not-found") return;
        throw error;
    }
}

export async function logout() {
    await signOut(getFirebaseAuth());
    // Il QueryClient è un singleton di modulo che sopravvive al logout: senza
    // questo, chi entra dopo vede i dati in cache dell'utente precedente finché
    // il refetch non risponde (e se il refetch fallisce, li vede per sempre).
    queryClient.clear();
    // Stesso motivo: il transcript di RiceVito contiene importi e codici di chi
    // ha appena chiuso la sessione.
    clearConversation();
}

export async function getBearerToken(): Promise<string | null> {
    const user = getFirebaseAuth().currentUser;
    if (!user) return null;
    return user.getIdToken();
}
